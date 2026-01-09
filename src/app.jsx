import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { bingoItems } from "./bingo_items";
import "./app.css";

const App = () => {
  const [clickedSquares, setClickedSquares] = useState(new Set());
  const [hoveredSquare, setHoveredSquare] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedTile, setSelectedTile] = useState(null);
  const [swapTile1, setSwapTile1] = useState("");
  const [swapTile2, setSwapTile2] = useState("");
  const gridRef = useRef(null);
  const rollIntervalRef = useRef(null);

  const [tiles, setTiles] = useState(bingoItems);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stateParam = params.get("state");
    const swap1Param = params.get("swap1");
    const swap2Param = params.get("swap2");

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
        console.error("Error parsing state from URL:", error);
      }
    }

    if (swap1Param) setSwapTile1(swap1Param);
    if (swap2Param) setSwapTile2(swap2Param);

    // Apply swap from URL params
    if (swap1Param && swap2Param) {
      const idx1 = parseInt(swap1Param) - 1;
      const idx2 = parseInt(swap2Param) - 1;

      if (
        !isNaN(idx1) && !isNaN(idx2) && idx1 >= 0 && idx1 < bingoItems.length &&
        idx2 >= 0 && idx2 < bingoItems.length && idx1 !== idx2
      ) {
        const newTiles = [...bingoItems];
        [newTiles[idx1], newTiles[idx2]] = [newTiles[idx2], newTiles[idx1]];
        setTiles(newTiles);
      }
    }
  }, []);

  useEffect(() => {
    let bits = 0;

    clickedSquares.forEach((index) => {
      bits |= 1 << index;
    });

    const hexState = bits.toString(16);
    const url = new URL(window.location);

    if (bits > 0) {
      url.searchParams.set("state", hexState);
    } else {
      url.searchParams.delete("state");
    }

    if (swapTile1) {
      url.searchParams.set("swap1", swapTile1);
    } else {
      url.searchParams.delete("swap1");
    }

    if (swapTile2) {
      url.searchParams.set("swap2", swapTile2);
    } else {
      url.searchParams.delete("swap2");
    }

    window.history.replaceState({}, "", url);
  }, [clickedSquares, swapTile1, swapTile2]);

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

  const handleSwapInput = (value, inputNumber) => {
    if (inputNumber === 1) {
      setSwapTile1(value);
      if (value && swapTile2) {
        performSwap(value, swapTile2);
      }
    } else {
      setSwapTile2(value);
      if (swapTile1 && value) {
        performSwap(swapTile1, value);
      }
    }
  };

  const performSwap = (val1, val2) => {
    const idx1 = parseInt(val1) - 1;
    const idx2 = parseInt(val2) - 1;

    if (
      isNaN(idx1) || isNaN(idx2) || idx1 < 0 || idx1 >= bingoItems.length ||
      idx2 < 0 || idx2 >= bingoItems.length
    ) {
      return;
    }

    if (idx1 === idx2) {
      return;
    }

    // Always swap from the base bingoItems array
    const newTiles = [...bingoItems];
    [newTiles[idx1], newTiles[idx2]] = [newTiles[idx2], newTiles[idx1]];
    setTiles(newTiles);
    console.log(newTiles);
  };

  const saveAsImage = async () => {
    if (!gridRef.current) return;

    try {
      // Dynamically import html2canvas
      const html2canvas =
        (await import("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm"))
          .default;

      const canvas = await html2canvas(gridRef.current, {
        backgroundColor: "#0F0F0F",
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement("a");
      link.download = "zerk-team-bingo.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error saving image:", error);
      alert("Failed to save image. Please try again.");
    }
  };

  const rollRandomTile = () => {
    const uncompletedTiles = tiles
      .map((_, index) => index)
      .filter((index) => !clickedSquares.has(index));

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

      const randomIndex =
        uncompletedTiles[Math.floor(Math.random() * uncompletedTiles.length)];
      setSelectedTile(randomIndex);
      setHoveredSquare(randomIndex);

      if (rollCount >= maxRolls) {
        clearInterval(rollIntervalRef.current);

        const finalTile =
          uncompletedTiles[Math.floor(Math.random() * uncompletedTiles.length)];
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
              gap: "0.25rem",
              padding: "0.25rem",
            }}
          >
            {tiles.map((item, index) => {
              const isClicked = clickedSquares.has(index);

              return (
                <div
                  key={index}
                  className="relative aspect-square cursor-pointer transition-all flex items-center justify-center"
                  style={{
                    borderWidth: "2px",
                    borderColor: isClicked
                      ? "#E6A519"
                      : (selectedTile === index)
                      ? "#FF0000"
                      : "#474745",
                    borderStyle: "solid",
                    boxShadow: (selectedTile === index)
                      ? "0 0 20px #FF0000"
                      : "none",
                    transform: (selectedTile === index && isRolling)
                      ? "scale(1.1)"
                      : "scale(1)",
                    zIndex: (selectedTile === index && isRolling)
                      ? "2"
                      : "unset",
                    backgroundColor: "#46433A",
                    // backgroundImage: "url('" + item.image + "')",
                    // backgroundSize: "min(60%, 60px) auto",
                    // backgroundRepeat: "no-repeat",
                    // backgroundPosition: "center center",
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
                        e.currentTarget.style.borderColor = "#474745";
                      }
                    }
                  }}
                >
                  <div
                    className="absolute top-1 left-1 text-s font-bold"
                    style={{
                      color: "#FFCF3F",
                      textShadow: "2px 2px 0px black",
                    }}
                  >
                    {item.index}
                  </div>
                  <img className="tile-icon" src={item.image}></img>
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
                    {tiles[hoveredSquare].title}
                  </h3>
                  <div
                    className="text-xl mt-2"
                    style={{
                      color: "#FFCF3F",
                      textShadow: "2px 2px 0px black",
                    }}
                  >
                    {tiles[hoveredSquare].text}
                  </div>
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

        <div className="flex justify-center mt-6 gap-4 flex-wrap">
          <button
            onClick={rollRandomTile}
            disabled={isRolling}
            className="flex items-center gap-2 font-bold py-2 px-6 transition-colors"
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
            onMouseEnter={(e) => e.target.style.backgroundColor = "#FFCF3F"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#E6A519"}
          >
            <Download className="w-5 h-5" />
            Save as Image
          </button>
        </div>

        <div className="flex justify-center mt-6 gap-2 items-center">
          <span style={{ color: "#FFCF3F" }} className="font-bold">
            Swap Tiles:
          </span>
          <input
            type="number"
            min="1"
            max="30"
            value={swapTile1}
            onChange={(e) => handleSwapInput(e.target.value, 1)}
            placeholder="Tile #"
            className="w-20 px-2 py-1 text-center"
            style={{
              backgroundColor: "#46433A",
              color: "#FFCF3F",
              border: "2px solid #694D23",
            }}
          />
          <span style={{ color: "#FFCF3F" }}>↔</span>
          <input
            type="number"
            min="1"
            max="30"
            value={swapTile2}
            onChange={(e) => handleSwapInput(e.target.value, 2)}
            placeholder="Tile #"
            className="w-20 px-2 py-1 text-center"
            style={{
              backgroundColor: "#46433A",
              color: "#FFCF3F",
              border: "2px solid #694D23",
            }}
          />
          <button
            onClick={() => {
              setSwapTile1("");
              setSwapTile2("");
              setTiles(bingoItems);
            }}
            className="font-bold py-1 px-4 transition-colors"
            style={{
              backgroundColor: "#694D23",
              color: "#FFCF3F",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#8B6330"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#694D23"}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
