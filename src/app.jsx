import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import './app.css'

const App = () => {
  const [clickedSquares, setClickedSquares] = useState(new Set());
  const [hoveredSquare, setHoveredSquare] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedTile, setSelectedTile] = useState(null);
  const gridRef = useRef(null);
  const rollIntervalRef = useRef(null);

  // Load state from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stateParam = params.get('state');
    
    if (stateParam) {
      try {
        const bits = parseInt(stateParam, 16);
        const newSet = new Set();
        
        for (let i = 0; i < bingoItems.length; i++) {
          if (bits & (1 << i)) {
            newSet.add(i);
          }
        }
        
        setClickedSquares(newSet);
      } catch (error) {
        console.error('Error parsing state from URL:', error);
      }
    }
  }, []);

  // Update URL when state changes
  useEffect(() => {
    let bits = 0;
    
    clickedSquares.forEach(index => {
      bits |= (1 << index);
    });
    
    const hexState = bits.toString(16);
    const url = new URL(window.location);
    
    if (bits > 0) {
      url.searchParams.set('state', hexState);
    } else {
      url.searchParams.delete('state');
    }
    
    window.history.replaceState({}, '', url);
  }, [clickedSquares]);

  const bingoItems = [
  {
    title: "Venomous Jeweler",
    text: (
      <ul>
        <li>Araxyte fang</li>
        <li>Onyx</li>
        <li>Zenyte shard</li>
      </ul>
    ),
  },
  {
    title: "Catch These Hands",
    text: (
      <ul>
        <li>Mokhaiotl cloth</li>
        <li>Onyx</li>
        <li>Zenyte shard</li>
      </ul>
    ),
  },
  {
    title: "Demonic Arsenal",
    text: (
      <ul>
        <li>Any abyssal weapon</li>
        <li>Tormented synapse</li>
        <li>Eye of ayak</li>
      </ul>
    ),
  },
  {
    title: "Eternal Love",
    text: (
      <ul>
        <li>Imbued heart</li>
        <li className="or">OR</li>
        <li>Eternal gem</li>
      </ul>
    ),
  },
  {
    title: "Triple Double",
    text: (
      <ul>
        <li>Tonalztics of ralos</li>
        <li>Dark bow</li>
        <li>Fire element staff crown</li>
        <li>Ice element staff crown</li>
      </ul>
    ),
  },
  {
    title: "Ranged Fortification",
    text: (
      <ul>
        <li>Masori armor piece</li>
        <li>Armadyl armor piece</li>
      </ul>
    ),
  },
  {
    title: "Melee Fortification",
    text: (
      <ul>
        <li>Torva armor piece</li>
        <li>Bandos armor piece (excluding Bandos boots)</li>
      </ul>
    ),
  },
  {
    title: "What Was That?",
    text: (
      <ul>
        <li>Bandos boots</li>
        <li>Black tourmaline core</li>
        <li>Echo crystal</li>
      </ul>
    ),
  },
  {
    title: "The Lizard Sticker",
    text: (
      <ul>
        <li>Zamorakian spear</li>
        <li>Hydra's claw</li>
      </ul>
    ),
  },
  {
    title: "Theatre of Blood",
    text: (
      <ul>
        <li>2 purples from Theatre of Blood</li>
      </ul>
    ),
  },
  {
    title: "Hellhound's Heels",
    text: (
      <ul>
        <li>Pegasian crystal</li><li>Ranger boots</li>
        <li className="or">OR</li>
        <li>Eternal crystal</li><li>Infinity boots</li>
        <li className="or">OR</li>
        <li>Primordial crystal</li><li>Dragon boots</li>
      </ul>
    ),
  },
  {
    title: "Lord of the Bling",
    text: (
      <ul>
        <li>DT2 Vestige</li>
        <li>Matching DK ring</li>
      </ul>
    ),
  },
  {
    title: "Risk Assessment",
    text: (
      <ul>
        <li>Craw's bow</li><li>Fangs of venenatis</li>
        <li className="or">OR</li>
        <li>Viggora's chainmace</li><li>Claws of callisto</li>
        <li className="or">OR</li>
        <li>Thammaron's sceptre</li><li>Skull of vet'ion</li>
      </ul>
    ),
  },
  {
    title: "Lesser of Two Evils",
    text: (
      <ul>
        <li>Nightmare unique</li>
        <li className="or">OR</li>
        <li>Yama unique</li>
      </ul>
    ),
  },
  {
    title: "Chambers of Xeric",
    text: (
      <ul>
        <li>2 purples from Chambers of Xeric</li>
      </ul>
    ),
  },
  {
    title: "Toxic Relationship",
    text: (
      <ul>
        <li>Staff of the dead</li>
        <li>Magic fang</li>
      </ul>
    ),
  },
  {
    title: "Who Sharded?",
    text: (
      <ul>
        <li>Any Godsword hilt</li>
        <li>3 unique Godsword shards</li>
      </ul>
    ),
  },
  {
    title: "Plunderin' Booty",
    text: (
      <ul>
        <li>Tiny pearl</li>
        <li>Ray barbs</li>
        <li>Swift albatross feather</li>
        <li>Echo pearl</li>
        <li>Narwhal horn</li>
        <li>Dragon metal sheet</li>
        <li>Dragon nails</li>
      </ul>
    ),
  },
  {
    title: "Elemental Elegance",
    text: (
      <ul>
        <li>Tome of fire</li>
        <li>Tome of water</li>
        <li>Tome of earth</li>
      </ul>
    ),
  },
  {
    title: "Tombs of Amascut",
    text: (
      <ul>
        <li>2 purples from Tombs of Amascut</li>
      </ul>
    ),
  },
  {
    title: "Weaponized Moontism",
    text: (
      <ul>
        <li>Dual macuahuitl</li>
        <li>Eclipse atlatl</li>
        <li>Blue moon spear</li>
      </ul>
    ),
  },
  {
    title: "Phantom Dancer",
    text: (
      <ul>
        <li>3 Venator shards</li>
      </ul>
    ),
  },
  {
    title: "Gryphon Tamer",
    text: (
      <ul>
        <li>Belle's folly</li>
      </ul>
    ),
  },
  {
    title: "Skills Master",
    text: (
      <ul>
        <li style={{color:'white'}}>Choose 3:</li>
        <li>Fletching knife</li>
        <li>Tackle box</li>
        <li>Fish barrel</li>
        <li>Bruma torch</li>
        <li>Strange old lockpick</li>
        <li>Imcando hammer</li>
      </ul>
    ),
  },
  {
    title: "Bob Ross",
    text: (
      <ul>
        <li>3 tradeable boat paints (excluding Merchant's paint)</li>
      </ul>
    ),
  },
  {
    title: "Brothers Brawl",
    text: (
      <ul>
        <li>Full set of Barrows armor (any helm/chest/legs)</li>
      </ul>
    ),
  },
  {
    title: "King of the Rats",
    text: (
      <ul>
        <li>Brine sabre</li>
        <li>3 Scurrius' spines</li>
      </ul>
    ),
  },
  {
    title: "Freaky Forester",
    text: (
      <ul>
        <li>Golden pheasant egg</li>
        <li>Fox whistle</li>
      </ul>
    ),
  },
  {
    title: "Medieval Meleer",
    text: (
      <ul>
        <li>Sulphur blades</li>
        <li>Glacial temotli</li>
        <li>Earthbound tecpatl</li>
      </ul>
    ),
  },
  {
    title: "FeelsBadMan",
    text: (
      <ul>
        <li>Champion scroll</li>
        <li>Curved bone</li>
        <li>Long bone</li>
      </ul>
    ),
  },
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

  const rollRandomTile = () => {
    // Get all uncompleted tiles
    const uncompletedTiles = bingoItems
      .map((_, index) => index)
      .filter(index => !clickedSquares.has(index));

    if (uncompletedTiles.length === 0) {
      alert("All tiles are already completed!");
      return;
    }

    setIsRolling(true);
    setSelectedTile(null);

    let rollCount = 0;
    const maxRolls = 30;
    const baseSpeed = 50;

    const roll = () => {
      rollCount++;
      
      const randomIndex = uncompletedTiles[Math.floor(Math.random() * uncompletedTiles.length)];
      setSelectedTile(randomIndex);
      setHoveredSquare(randomIndex);

      if (rollCount >= maxRolls) {
        clearInterval(rollIntervalRef.current);
        
        const finalTile = uncompletedTiles[Math.floor(Math.random() * uncompletedTiles.length)];
        setSelectedTile(finalTile);
        setHoveredSquare(finalTile);
        setIsRolling(false);
      } else if (rollCount > maxRolls - 10) {
        clearInterval(rollIntervalRef.current);
        const newSpeed = baseSpeed + (rollCount - (maxRolls - 10)) * 30;
        rollIntervalRef.current = setInterval(roll, newSpeed);
      }
    };

    rollIntervalRef.current = setInterval(roll, baseSpeed);
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
            }}
          >
            {bingoItems.map((item, index) => {
              const isClicked = clickedSquares.has(index);

              return (
                <div
                  key={index}
                  className="relative aspect-square cursor-pointer transition-all"
                  style={{
                    borderWidth: "2px",
                    borderColor: isClicked ? "#E6A519" : (selectedTile === index) ? "#FF0000" : "transparent",
                    borderStyle: "solid",
                    boxShadow: (selectedTile === index) ? "0 0 20px #FF0000" : "none",
                    transform: (selectedTile === index && isRolling) ? "scale(1.1)" : "scale(1)",
                    zIndex: (selectedTile === index && isRolling) ? "2" : "unset",
                  }}
                  onClick={() => toggleSquare(index)}
                  onMouseEnter={(e) => {
                    if (!isRolling) {
                      setHoveredSquare(index);
                      if (!isClicked) {
                        e.currentTarget.style.borderColor = "#E6A519";
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isRolling) {
                      setHoveredSquare(null);
                      if (!isClicked) {
                        e.currentTarget.style.borderColor = "transparent";
                      }
                    }
                  }}
                >
                  {isClicked && (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
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
            className="p-6 flex items-center justify-center"
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
                  <h3
                    className="text-3xl font-semibold"
                    style={{
                      color: "#FFCF3F",
                      textShadow: "2px 2px 0px black",
                    }}
                  >
                    {bingoItems[hoveredSquare].title}
                  </h3>
                  <p
                    className="text-xl mt-2"
                    style={{
                      color: "#FFCF3F",
                      textShadow: "2px 2px 0px black",
                    }}
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
            onClick={rollRandomTile}
            disabled={isRolling}
            className="flex items-center gap-2 font-bold py-2 px-6 mr-4 transition-colors"
            style={{
              backgroundColor: isRolling ? "#666" : "#FF6B35",
              color: "#FFFFFF",
              cursor: isRolling ? "not-allowed" : "pointer",
              opacity: isRolling ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isRolling) e.target.style.backgroundColor = "#FF8555";
            }}
            onMouseLeave={(e) => {
              if (!isRolling) e.target.style.backgroundColor = "#FF6B35";
            }}
          >
            🎲 {isRolling ? "Rolling..." : "Roll Random Tile"}
          </button>
          <button
            onClick={saveAsImage}
            className="flex items-center gap-2 font-bold py-2 px-6 transition-colors"
            style={{
              backgroundColor: "#E6A519",
              color: "#0F0F0F",
              cursor: "pointer",
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