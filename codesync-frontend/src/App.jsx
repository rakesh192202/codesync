import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {

  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [receiver, setReceiver] = useState("");
  const [joined, setJoined] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");

  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);

  // Store ICE candidates that arrive early
  const pendingCandidatesRef = useRef([]);


  // ==========================================
  // WEBSOCKET CONNECTION
  // ==========================================

  useEffect(() => {

    if (!joined) {
      return;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

const wsUrl = backendUrl
  .replace("https://", "wss://")
  .replace("http://", "ws://");

const socket = new WebSocket(
  `${wsUrl}/ws/signaling?username=${encodeURIComponent(username)}&roomCode=${encodeURIComponent(roomCode)}`
);

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("CodeSync WebSocket connected");
    };


    // ==========================================
    // RECEIVE SIGNALING MESSAGE
    // ==========================================

    socket.onmessage = async (event) => {

      const message = JSON.parse(event.data);

      console.log(
        "Received signaling message:",
        message
      );
      if (message.type === "USER_LIST") {

  console.log("Connected users:", message.users);

  setConnectedUsers(message.users);

  return;
}


      // ------------------------------------------
      // OFFER
      // ------------------------------------------

      if (message.type === "OFFER") {

        console.log("Received WebRTC OFFER");

        await handleOffer(message);
      }


      // ------------------------------------------
      // ANSWER
      // ------------------------------------------

      else if (message.type === "ANSWER") {

        console.log("Received WebRTC ANSWER");

        await handleAnswer(message);
      }


      // ------------------------------------------
      // ICE CANDIDATE
      // ------------------------------------------

      else if (message.type === "ICE_CANDIDATE") {

        console.log(
          "Received ICE candidate"
        );

        await handleIceCandidate(message);
      }

    };


    socket.onclose = () => {
      console.log(
        "CodeSync WebSocket disconnected"
      );
    };


    socket.onerror = (error) => {
      console.error(
        "WebSocket error:",
        error
      );
    };


    return () => {

      socket.close();

      socketRef.current = null;

    };

  }, [joined, username, roomCode]);


  // ==========================================
  // JOIN ROOM
  // ==========================================

  function joinRoom() {

    if (
      username.trim() === "" ||
      roomCode.trim() === ""
    ) {

      alert(
        "Please enter username and room code"
      );

      return;
    }

    setJoined(true);
  }


  // ==========================================
  // CREATE PEER CONNECTION
  // ==========================================

  function createPeerConnection(isOfferer) {

    const configuration = {

      iceServers: [

        {
          urls: "stun:stun.l.google.com:19302"
        }

      ]

    };


    const peerConnection =
      new RTCPeerConnection(configuration);


    peerConnectionRef.current =
      peerConnection;


    // ==========================================
    // ICE CANDIDATE
    // ==========================================

    peerConnection.onicecandidate = (event) => {

      if (!event.candidate) {
        return;
      }

      console.log(
        "Sending ICE candidate"
      );


      const message = {

        type: "ICE_CANDIDATE",

        sender: username,

        receiver: receiver,

        roomCode: roomCode,

        data: {

          candidate: event.candidate

        }

      };


      socketRef.current.send(
        JSON.stringify(message)
      );

    };


    // ==========================================
    // OFFERER CREATES DATA CHANNEL
    // ==========================================

    if (isOfferer) {

      const dataChannel =
        peerConnection.createDataChannel("code");


      dataChannelRef.current =
        dataChannel;


      setupDataChannel(dataChannel);

    }


    // ==========================================
    // RECEIVER GETS DATA CHANNEL
    // ==========================================

    peerConnection.ondatachannel = (event) => {

      console.log(
        "Received WebRTC DataChannel"
      );


      dataChannelRef.current =
        event.channel;


      setupDataChannel(
        event.channel
      );

    };


    console.log(
      "Peer connection created"
    );


    return peerConnection;
  }


  // ==========================================
  // DATA CHANNEL
  // ==========================================

  function setupDataChannel(dataChannel) {

    dataChannel.onopen = () => {

      console.log(
        "👍🏼 WebRTC DataChannel connected"
      );

    };

    
    dataChannel.onmessage = (event) => {

  console.log(
    "WebRTC received:",
    event.data
  );

  setCode(event.data);
};


    dataChannel.onclose = () => {

      console.log(
        "WebRTC DataChannel disconnected"
      );

    };

  }


  // ==========================================
  // CREATE OFFER
  // ==========================================

  async function createOffer() {

    if (
      !socketRef.current ||
      socketRef.current.readyState !== WebSocket.OPEN
    ) {

      console.log(
        "WebSocket is not connected"
      );

      return;
    }


    if (!receiver.trim()) {

      alert(
        "Please enter receiver username"
      );

      return;
    }


    // Create OFFERER connection
    const peerConnection =
      createPeerConnection(true);


    // Create offer
    const offer =
      await peerConnection.createOffer();


    // Set local description
    await peerConnection.setLocalDescription(
      offer
    );


    console.log(
      "WebRTC offer created"
    );


    const message = {

      type: "OFFER",

      sender: username,

      receiver: receiver,

      roomCode: roomCode,

      data: {

        offer: offer

      }

    };


    socketRef.current.send(
      JSON.stringify(message)
    );


    console.log(
      "WebRTC offer sent:",
      message
    );

  }


  // ==========================================
  // HANDLE OFFER
  // ==========================================

  async function handleOffer(message) {

    console.log(
      "Processing received OFFER"
    );


    // IMPORTANT:
    // Receiver does NOT create a DataChannel.
    // It waits for ondatachannel.

    const peerConnection =
      createPeerConnection(false);


    // Set remote offer
    await peerConnection.setRemoteDescription(
      message.data.offer
    );


    console.log(
      "Remote OFFER set"
    );


    // Create answer
    const answer =
      await peerConnection.createAnswer();


    // Set local answer
    await peerConnection.setLocalDescription(
      answer
    );


    console.log(
      "WebRTC answer created"
    );


    const answerMessage = {

      type: "ANSWER",

      sender: username,

      receiver: message.sender,

      roomCode: roomCode,

      data: {

        answer: answer

      }

    };


    socketRef.current.send(
      JSON.stringify(answerMessage)
    );


    console.log(
      "WebRTC answer sent"
    );


    // Add ICE candidates that arrived early
    for (
      const candidate
      of pendingCandidatesRef.current
    ) {

      try {

        await peerConnection.addIceCandidate(
          candidate
        );

      } catch (error) {

        console.error(
          "Error adding pending ICE candidate:",
          error
        );

      }

    }


    pendingCandidatesRef.current = [];

  }


  // ==========================================
  // HANDLE ANSWER
  // ==========================================

  async function handleAnswer(message) {

    console.log(
      "Processing received ANSWER"
    );


    const peerConnection =
      peerConnectionRef.current;


    if (!peerConnection) {

      console.log(
        "Peer connection does not exist"
      );

      return;
    }


    await peerConnection.setRemoteDescription(
      message.data.answer
    );


    console.log(
      "Remote ANSWER set"
    );


    // Add pending ICE candidates
    for (
      const candidate
      of pendingCandidatesRef.current
    ) {

      try {

        await peerConnection.addIceCandidate(
          candidate
        );

      } catch (error) {

        console.error(
          "Error adding pending ICE candidate:",
          error
        );

      }

    }


    pendingCandidatesRef.current = [];

  }


  // ==========================================
  // HANDLE ICE CANDIDATE
  // ==========================================

  async function handleIceCandidate(message) {

    const candidate =
      message.data.candidate;


    const peerConnection =
      peerConnectionRef.current;


    if (!peerConnection) {

      console.log(
        "Peer connection not ready. Saving ICE candidate."
      );


      pendingCandidatesRef.current.push(
        candidate
      );


      return;
    }


    // If remote description isn't ready,
    // save candidate for later

    if (!peerConnection.remoteDescription) {

      console.log(
        "Remote description not ready. Saving ICE candidate."
      );


      pendingCandidatesRef.current.push(
        candidate
      );


      return;
    }


    try {

      await peerConnection.addIceCandidate(
        candidate
      );


      console.log(
        "ICE candidate added"
      );

    } catch (error) {

      console.error(
        "Error adding ICE candidate:",
        error
      );

    }

  }



  ///handelcodeExcjange()
  function handleCodeChange(event) {

  const newCode = event.target.value;

  setCode(newCode);

  const dataChannel =
    dataChannelRef.current;

  if (
    dataChannel &&
    dataChannel.readyState === "open"
  ) {

    dataChannel.send(newCode);

    console.log(
      "Code sent through WebRTC"
    );
  }
}


async function runCode() {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const response = await fetch(
      `${backendUrl}/api/execute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          language: "java",
          code: code
        })
      }
    );

    const result = await response.text();

    if (!response.ok) {
      throw new Error(result || "Code execution failed");
    }

    setOutput(result);

    console.log("Code execution result:", result);

  } catch (error) {
    console.error("Execution error:", error);

    setOutput(
      "Could not execute code: " + error.message
    );
  }
}


  // ==========================================
  // JOIN SCREEN
  // ==========================================

  if (!joined) {

    return (

      <div className="room-page">

        <h1>CodeSync</h1>

        <p>
          Collaborative coding made simple.
        </p>


        <input
          type="text"
          placeholder="Enter your name"
          value={username}
          onChange={(event) =>
            setUsername(event.target.value)
          }
        />


        <input
          type="text"
          placeholder="Enter room code"
          value={roomCode}
          onChange={(event) =>
            setRoomCode(event.target.value)
          }
        />


        <button onClick={joinRoom}>
          Join Room
        </button>

      </div>

    );

  }


  // ==========================================
  // MAIN APPLICATION
  // ==========================================

  return (

    <div className="app">


      <header className="header">

        <h1>
          CodeSync
        </h1>


        <div className="room-info">

          Room:
          <strong>
            {roomCode}
          </strong>

        </div>

      </header>


      <main className="main">


        <section className="editor-section">


          <div className="section-header">

            <span>
              Java
            </span>


            <span className="status">

              ● Connected

            </span>

          </div>


         <textarea
  className="code-editor"
  value={code}
  onChange={handleCodeChange}
  placeholder="Write your Java code here..."
/>


        </section>


        <aside className="users-section">


          <h2>
            Connected Users
          </h2>


         {connectedUsers.map((user) => (

  <div className="user" key={user}>

    <span className="user-dot">
    </span>

    {user}

  </div>

))}


        </aside>


      </main>


      <section className="output-section">


        <div className="output-header">


          <span>
            Output
          </span>


          <div>


            <input
              type="text"
              placeholder="Receiver username"
              value={receiver}
              onChange={(event) =>
                setReceiver(event.target.value)
              }
            />


            <button onClick={createOffer}>

              Create WebRTC Offer

            </button>


           <button onClick={runCode}>
             Run Code
          </button>


            


          </div>


        </div>


        <pre>
         {output}
        </pre>


      </section>


    </div>

  );

}

export default App;