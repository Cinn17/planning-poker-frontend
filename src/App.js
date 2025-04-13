import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://YOUR-BACKEND-URL.repl.co"); // replace with real backend URL

function App() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("main");
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState([]);
  const [vote, setVote] = useState(null);
  const [votes, setVotes] = useState({});
  const [votesRevealed, setVotesRevealed] = useState(false);

  const cards = ["1", "2", "3", "5", "8", "13", "?"];

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-pink-100 p-4 flex flex-col items-center justify-start">
        <h1 className="text-4xl font-bold text-indigo-700 mb-6 mt-4">🃏 Planning Poker</h1>

        {!joined ? (
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md space-y-4">
              <input
                  type="text"
                  placeholder="Your name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  onChange={(e) => setName(e.target.value)}
              />
              <input
                  type="text"
                  placeholder="Room ID"
                  defaultValue="main"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  onChange={(e) => setRoom(e.target.value)}
              />
              <button
                  onClick={joinRoom}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white p-3 rounded-lg font-semibold shadow"
              >
                Join Room
              </button>
            </div>
        ) : (
            <div className="w-full max-w-5xl">
              <h2 className="text-2xl text-indigo-800 font-semibold mb-4 text-center">Room: {room}</h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                {users.map((user, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow p-4 text-center">
                      <p className="font-medium text-indigo-700">{user}</p>
                      {votesRevealed && votes && (
                          <p className="text-2xl font-bold mt-2 text-gray-800">{votes[user] || "—"}</p>
                      )}
                    </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-4 mb-6">
                {cards.map((val) => (
                    <button
                        key={val}
                        onClick={() => sendVote(val)}
                        className={`w-16 h-16 text-xl font-bold rounded-full transition-all duration-200 shadow-lg hover:scale-105
                  ${
                            vote === val
                                ? "bg-green-500 text-white"
                                : "bg-white text-gray-800 border-2 border-indigo-300"
                        }`}
                    >
                      {val}
                    </button>
                ))}
              </div>

              <div className="flex justify-center gap-4">
                <button
                    onClick={() => socket.emit("resetVotes", room)}
                    className="bg-red-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
                >
                  Reset Votes
                </button>
                <button
                    onClick={() => socket.emit("reveal", room)}
                    className="bg-indigo-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-600 transition"
                >
                  Reveal Votes
                </button>
              </div>
            </div>
        )}
      </div>
  );
}

export default App;
