import { useRef, useState } from "react";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import "./app.css";

const App = () => {
  const [clickedSquares, setClickedSquares] = useState(new Set());
  const [hoveredSquare, setHoveredSquare] = useState(null);
  const gridRef = useRef(null);

  const bingoItems = [
    { text: "Venomous Jeweler" },
    { text: "Catch These Hands" },
    { text: "Demonic Arsenal" },
    { text: "Eternal Love" },
    { text: "Triple Double" },
    { text: "Ranged Fortification" },
    { text: "Melee Fortification" },
    { text: "What Was That?" },
    { text: "The Lizard Sticker" },
    { text: "Theatre of Blood" },
    { text: "Hellhound's Heels" },
    { text: "Lord of the Bling" },
    { text: "Risk Assessment" },
    { text: "Lesser of Two Evils" },
    { text: "Chambers of Xeric" },
    { text: "Toxic Relationship" },
    { text: "Who Sharded?" },
    { text: "Mid-Game Magician" },
    { text: "Elemental Elegance" },
    { text: "Tombs of Amascut" },
    { text: "Weaponized Moontism" },
    { text: "Phantom Dancer" },
    { text: "Gryphon Tamer" },
    { text: "Skills Master" },
    { text: "Bob Ross" },
    { text: "Brothers Brawl" },
    { text: "King of the Rats" },
    { text: "Freaky Forester" },
    { text: "Medieval Meleer" },
    { text: "FeelsBadMan" },
  ];

  const toggleSquare = (index) => {
    setClickedSquares((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const saveAsImage = async () => {
    if (!gridRef.current) return;

    try {
      // const html2canvas = (await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm')).default;

      const canvas = await html2canvas(gridRef.current, {
        backgroundColor: "#0F0F0F",
        scale: 2,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = "osrs-bingo.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error saving image:", error);
      alert("Failed to save image. Please try again.");
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "#2E2C29" }}>
      <div className="max-w-6xl mx-auto">
        <h1
          className="text-4xl font-bold text-center mb-2"
          style={{ fontFamily: "serif", color: "#FFCF3F" }}
        >
          Zerk Team Bingo
        </h1>
        <p className="text-center mb-4" style={{ color: "#00FFFF" }}>
          Click squares to mark them complete!
        </p>

        <div className="grid grid-cols-2 gap-6 items-start">
          <div
            ref={gridRef}
            className="grid grid-cols-5"
            style={{
              backgroundColor: "#0F0F0F",
              borderWidth: "4px",
              borderColor: "#694D23",
              borderStyle: "solid",
              background: "url(./board.png)",
              backgroundSize: "contain",
              // gap:'1%'
            }}
          >
            {bingoItems.map((item, index) => {
              const Icon = item.icon;
              const isClicked = clickedSquares.has(index);

              return (
                <div
                  key={index}
                  className="relative aspect-square  cursor-pointer transition-all"
                  style={{
                    // backgroundColor: "#46433A",
                    borderWidth: "2px",
                    borderColor: isClicked ? "#E6A519" : "#474745",
                    borderStyle: "solid",
                  }}
                  onClick={() => toggleSquare(index)}
                  onMouseEnter={(e) => {
                    setHoveredSquare(index);
                    if (!isClicked) {
                      e.currentTarget.style.borderColor = "#E6A519";
                    }
                  }}
                  onMouseLeave={(e) => {
                    setHoveredSquare(null);
                    if (!isClicked) {
                      e.currentTarget.style.borderColor = "#474745";
                    }
                  }}
                >
                  {
                    /* <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className={`w-12 h-12 ${item.color}`} />
                  </div> */
                  }
                  {isClicked && (
                    <div
                      className="absolute inset-0  flex items-center justify-center"
                      style={{ backgroundColor: "rgba(0, 255, 0, 0.6)" }}
                    >
                      <div className="text-4xl" style={{ color: "#0F0F0F" }}>
                        ✓
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div
            className=" p-6 flex items-center justify-center"
            style={{
              backgroundColor: "#46433A",
              borderWidth: "2px",
              borderColor: "#474745",
              borderStyle: "solid",
              minHeight: "400px",
            }}
          >
            {hoveredSquare !== null
              ? (
                <div className="text-center">
                  <p
                    className="text-3xl font-semibold"
                    style={{ color: "#FFCF3F" }}
                  >
                    {bingoItems[hoveredSquare].text}
                  </p>
                </div>
              )
              : (
                <div
                  className="text-center italic text-lg"
                  style={{ color: "#00FFFF" }}
                >
                  Hover over a square to see details
                </div>
              )}
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <button
            onClick={saveAsImage}
            className="flex items-center gap-2 font-bold py-2 px-6  transition-colors"
            style={{
              backgroundColor: "#E6A519",
              color: "#0F0F0F",
              cursor:'pointer'
            }}
            onMouseEnter={(e) =>
              e.target.style.backgroundColor = "#FFCF3F"}
            onMouseLeave={(e) =>
              e.target.style.backgroundColor = "#E6A519"}
          >
            <Download className="w-5 h-5" />
            Save as Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
