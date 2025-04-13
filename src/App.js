import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://00b6573c-2a56-4cef-a7a1-c5de2a1a12b8-00-3v78pv54fwrcp.janeway.replit.dev/"); // replace this

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
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
        {!joined ? (
            <div className="bg-white p-6 rounded-lg shadow space-y-4 w-full max-w-sm">
              <input
                  type="text"
                  placeholder="Your name"
                  className="w-full p-2 border rounded"
                  onChange={(e) => setName(e.target.value)}
              />
              <input
                  type="text"
                  placeholder="Room ID"
                  defaultValue="main"
                  className="w-full p-2 border rounded"
                  onChange={(e) => setRoom(e.target.value)}
              />
              <button
                  onClick={joinRoom}
                  className="w-full bg-blue-600 text-white p-2 rounded"
              >
                Join Room
              </button>
            </div>
        ) : (
            <>
              <h2 className="text-2xl font-semibold mb-4">Room: {room}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {users.map((user, idx) => (
                    <div key={idx} className="bg-white p-3 rounded shadow">
                      <p className="font-medium">{user}</p>
                      {votesRevealed && votes && (
                          <p className="text-2xl mt-2">{votes[user] || "—"}</p>
                      )}
                    </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                {cards.map((val) => (
                    <button
                        key={val}
                        onClick={() => sendVote(val)}
                        className={`w-16 h-16 text-xl font-bold rounded ${
                            vote === val ? "bg-green-500" : "bg-gray-300"
                        }`}
                    >
                      {val}
                    </button>
                ))}
              </div>

              <button
                  onClick={() => socket.emit("resetVotes", room)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Reset Votes
              </button>
            </>
        )}
      </div>
  );
}

export default App;
