import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://YOUR-BACKEND-URL.repl.co"); // replace this

function App() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("main");
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState([]);
  const [vote, setVote] = useState(null);
  const [votes, setVotes] = useState({});
  const [votesRevealed, setVotesRevealed] = useState(false);

  const cards = [
    { value: "1", color: "bg-pink-200" },
    { value: "2", color: "bg-yellow-200" },
    { value: "3", color: "bg-green-200" },
    { value: "5", color: "bg-blue-200" },
    { value: "8", color: "bg-purple-200" },
    { value: "13", color: "bg-orange-200" },
    { value: "?", color: "bg-sky-200" },
  ];

  useEffect(() => {
    socket.on("usersUpdate", setUsers);
    socket.on("revealVotes", (votes) => {
      setVotes(votes);
      setVotesRevealed(true);
    });
    socket.on("reset", () => {
      setVotes({});
      setVote(null);
      setVotesRevealed(false);
    });
  }, []);

  const joinRoom = () => {
    socket.emit("joinRoom", { roomId: room, user: name });
    setJoined(true);
  };

  const sendVote = (val) => {
    setVote(val);
    socket.emit("vote", { roomId: room, vote: val });
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 to-indigo-100 flex items-center justify-center p-6">
        {!joined ? (
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-5 text-center">
              <h1 className="text-3xl font-bold text-indigo-600">Planning Poker</h1>
              <input
                  type="text"
                  placeholder="Your name"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  onChange={(e) => setName(e.target.value)}
              />
              <input
                  type="text"
                  placeholder="Room ID"
                  defaultValue="main"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  onChange={(e) => setRoom(e.target.value)}
              />
              <button
                  onClick={joinRoom}
                  className="w-full bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 font-semibold"
              >
                Join Room
              </button>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center w-full max-w-4xl space-y-6">
              <h2 className="text-2xl text-indigo-700 font-semibold">Room: {room}</h2>

              <div className="flex flex-wrap justify-center gap-6 mb-4">
                {cards.map(({ value, color }) => (
                    <button
                        key={value}
                        onClick={() => sendVote(value)}
                        className={`w-24 h-32 text-3xl font-bold rounded-2xl ${color} hover:brightness-110 transition shadow-md ${
                            vote === value ? "ring-4 ring-indigo-400 scale-105" : ""
                        }`}
                    >
                      {value}
                    </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                {users.map((user, idx) => (
                    <div
                        key={idx}
                        className="bg-white p-4 rounded-xl shadow text-center w-full"
                    >
                      <p className="font-semibold text-indigo-700">{user}</p>
                      {votesRevealed && (
                          <p className="text-xl mt-2">{votes[user] || "—"}</p>
                      )}
                    </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                    onClick={() => socket.emit("reveal", room)}
                    className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition font-semibold"
                >
                  Reveal Votes
                </button>
                <button
                    onClick={() => socket.emit("resetVotes", room)}
                    className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition font-semibold"
                >
                  Reset
                </button>
              </div>
            </div>
        )}
      </div>
  );
}

export default App;
