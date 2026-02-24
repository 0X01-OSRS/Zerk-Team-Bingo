import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { bingoItems } from "./bingo_items";
import html2canvas from "html2canvas";
import "./app.css";

const App = () => {
  const [clickedSquares, setClickedSquares] = useState(new Set());
  const [hoveredSquare, setHoveredSquare] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedTile, setSelectedTile] = useState(null);
  const [swapTile1, setSwapTile1] = useState("");
  const [swapTile2, setSwapTile2] = useState("");
  // checkedItems: { "tileIndex-itemIndex": true }
  const [checkedItems, setCheckedItems] = useState({});
  const gridRef = useRef(null);
  const rollIntervalRef = useRef(null);

  const [tiles, setTiles] = useState(bingoItems);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stateParam = params.get("state");
    const swap1Param = params.get("swap1");
    const swap2Param = params.get("swap2");
    const checkParam = params.get("checks");

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

    if (checkParam) {
      try {
        const decoded = JSON.parse(atob(checkParam));
        setCheckedItems(decoded);
      } catch (e) {
        console.error("Error parsing checks from URL:", e);
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

    if (Object.keys(checkedItems).length > 0) {
      url.searchParams.set("checks", btoa(JSON.stringify(checkedItems)));
    } else {
      url.searchParams.delete("checks");
    }

    window.history.replaceState({}, "", url);
  }, [clickedSquares, swapTile1, swapTile2, checkedItems]);

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

  const toggleItem = (tileIndex, itemIndex) => {
    const key = `${tileIndex}-${itemIndex}`;
    setCheckedItems((prev) => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = true;
      }

      // Sync board: mark tile complete if checklist threshold is met
      const tile = tiles[tileIndex];
      const required = tile.requiredCount || 0;
      const checkableItems = (tile.items || []).filter(i => i !== "OR" && i !== "Choose 3:");
      const checkedCount = checkableItems.filter((_, i) => next[`${tileIndex}-${i}`]).length;
      const nowDone = checkedCount >= required;

      setClickedSquares((prev) => {
        const newSet = new Set(prev);
        if (nowDone) {
          newSet.add(tileIndex);
        } else {
          newSet.delete(tileIndex);
        }
        return newSet;
      });

      return next;
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

    const newTiles = [...bingoItems];
    [newTiles[idx1], newTiles[idx2]] = [newTiles[idx2], newTiles[idx1]];
    setTiles(newTiles);
  };

  const saveAsImage = async () => {
    if (!gridRef.current) return;

    try {
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

  // Total checklist progress — count tiles where checked items >= requiredCount
  const tilesCompleteByChecklist = tiles.filter((tile, tileIndex) => {
    const required = tile.requiredCount || 0;
    const checkableItems = (tile.items || []).filter(i => i !== "OR" && i !== "Choose 3:");
    const checked = checkableItems.filter((_, i) => checkedItems[`${tileIndex}-${i}`]).length;
    return checked >= required;
  }).length;
  const totalTiles = tiles.length;

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "#2E2C29" }}>
      <div className="max-w-7xl mx-auto">
        <h1
          className="text-4xl font-bold text-center mb-2"
          style={{fontFamily:"serif", color: "#FFCF3F",textShadow:"3px 3px 0 black" }}
        >
          Zerk Team Bingo
        </h1>
        <p className="text-center mb-6" style={{ color: "#00FFFF" }}>
          Click squares to mark them complete!
        </p>

        <div className="flex flex-col lg:flex-row gap-4 items-start justify-center">
          <div className="flex gap-2">
            <div className="flex flex-col gap-1 p-1">
              {[0, 1, 2, 3, 4, 5].map((rowIndex) => {
                const rowColors = [
                  "linear-gradient(0deg,rgba(156, 28, 32, 1) 0%, rgba(255, 0, 0, 1) 100%)",
                  "linear-gradient(0deg,rgba(241, 90, 36, 1) 0%, rgba(247, 147, 30, 1) 100%)",
                  "linear-gradient(0deg,rgba(230, 165, 25, 1) 0%, rgba(252, 238, 33, 1) 100%)",
                  "linear-gradient(0deg,rgba(0, 104, 55, 1) 0%, rgba(0, 255, 0, 1) 100%)",
                  "linear-gradient(0deg,rgba(0, 113, 188, 1) 0%, rgba(0, 255, 255, 1) 100%)",
                  "linear-gradient(0deg,rgba(166, 73, 143, 1) 0%, rgba(255, 0, 255, 1) 100%)",
                ];
                return (
                  <div
                    key={rowIndex}
                    className="cursor-pointer transition-all flex-1"
                    style={{
                      width: "12px",
                      minHeight: "60px",
                      background: rowColors[rowIndex],
                      boxShadow: "3px 3px 0px black",
                    }}
                    onMouseEnter={() => setHoveredSquare(`row-${rowIndex}`)}
                    onMouseLeave={() =>
                      setHoveredSquare(null)}
                  />
                );
              })}
            </div>

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
                      width: "100px",
                      height: "100px",
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
                      className="absolute top-1 left-1 text-sm font-bold"
                      style={{
                        color: "#FFCF3F",
                        textShadow: "1px 1px 0px black",
                      }}
                    >
                      {item.index}
                    </div>
                    <img
                      className="tile-icon"
                      src={item.image}
                      alt={item.title}
                    />
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
          </div>

          <div
            className="w-full lg:w-96 p-6 flex items-center justify-center"
            style={{
              backgroundColor: "#46433A",
              borderWidth: "2px",
              borderColor: "#474745",
              borderStyle: "solid",
              minHeight: "300px",
            }}
          >
            {hoveredSquare !== null
              ? typeof hoveredSquare === "string" &&
                  hoveredSquare.startsWith("row-")
                ? (
                  <div className="text-center">
                    <h3
                      className="text-3xl font-semibold mb-4"
                      style={{
                        color: "#FFCF3F",
                        textShadow: "2px 2px 0px black",
                      }}
                    >
                      {[
                        "Spin to Win",
                        "Power of Friendship",
                        "Unique Exchange",
                        "Pet Promotion",
                        "Tile Transfer",
                        "Double Trouble",
                      ][parseInt(hoveredSquare.split("-")[1])]}
                    </h3>
                    <div
                      className="text-xl"
                      style={{
                        color: "#FFCF3F",
                        textShadow: "2px 2px 0px black",
                      }}
                    >
                      {[
                        "Auto-complete a random one of your remaining tiles",
                        "Validate 1 unique drop in a non-teammates name, as long as the team size is 5 or fewer",
                        "Swap the unique required on a boss drop table",
                        "Use a boss' pet drop in place of its unique drop",
                        "Swap the positions of 2 tiles",
                        "Validate 1 drop twice, choose to apply it to 2 separate tiles or 1 single tile",
                      ][parseInt(hoveredSquare.split("-")[1])]}
                    </div>
                  </div>
                )
                : (
                  <div className="text-center">
                    <h3
                      className="text-3xl font-semibold mb-2"
                      style={{
                        color: "#FFCF3F",
                        textShadow: "2px 2px 0px black",
                      }}
                    >
                      {tiles[hoveredSquare].title}
                    </h3>
                    <div
                      className="text-xl"
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
                  className="text-center italic text-base"
                  style={{ color: "#00FFFF" }}
                >
                  Hover over a square to see details
                </div>
              )}
          </div>
        </div>

        <div className="flex flex-wrap justify-center mt-6 gap-4">
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
              if (!isRolling) {
                e.target.style.backgroundColor = "#FF8555";
              }
            }}
            onMouseLeave={(e) => {
              if (!isRolling) {
                e.target.style.backgroundColor = "#FF6B35";
              }
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

        <div className="flex flex-wrap justify-center mt-6 gap-2 items-center">
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

        {/* ── Granular Checklist ── */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2
              className="text-2xl font-bold"
              style={{ fontFamily: "serif", color: "#FFCF3F", textShadow: "2px 2px 0 black" }}
            >
              Drop Checklist
            </h2>
            <div className="flex items-center gap-4">
              <span style={{ color: "#00FFFF" }} className="text-md">
                {tilesCompleteByChecklist} / {totalTiles} tiles complete
              </span>
              <button
                onClick={() => setCheckedItems({})}
                className="text-md font-bold py-1 px-3"
                style={{
                  backgroundColor: "#694D23",
                  color: "#FFCF3F",
                  cursor: "pointer",
                  border: "1px solid #474745",
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#8B6330"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#694D23"}
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div
            className="w-full mb-6"
            style={{
              height: "8px",
              backgroundColor: "#46433A",
              border: "1px solid #474745",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${totalTiles > 0 ? (tilesCompleteByChecklist / totalTiles) * 100 : 0}%`,
                backgroundColor: "#00FF00",
                transition: "width 0.3s ease",
                boxShadow: "0 0 8px #00FF00",
              }}
            />
          </div>

          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
          >
            {tiles.map((tile, tileIndex) => {
              const checkableItems = (tile.items || []).filter(
                (item) => item !== "OR" && item !== "Choose 3:"
              );
              const tileChecked = checkableItems.filter(
                (_, i) => checkedItems[`${tileIndex}-${i}`]
              ).length;
              const required = tile.requiredCount || checkableItems.length;
              const checklistDone = tileChecked >= required;
              const tileComplete = clickedSquares.has(tileIndex);

              return (
                <div
                  key={tileIndex}
                  style={{
                    backgroundColor: "#46433A",
                    border: `2px solid ${tileComplete ? "#E6A519" : checklistDone ? "#00AA00" : "#474745"}`,
                    padding: "12px",
                    position: "relative",
                  }}
                >
                  {/* Tile header */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-md font-bold px-1"
                      style={{
                        backgroundColor: "#694D23",
                        color: "#FFCF3F",
                        minWidth: "22px",
                        textAlign: "center",
                      }}
                    >
                      {tile.index}
                    </span>
                    <span
                      className="font-bold text-md"
                      style={{ color: "#FFCF3F", textShadow: "1px 1px 0 black" }}
                    >
                      {tile.title}
                    </span>
                    {tileComplete && (
                      <span
                        className="ml-auto text-md font-bold px-1"
                        style={{ color: "#00FF00", textShadow: "0 0 6px #00FF00" }}
                      >
                        ✓ COMPLETE
                      </span>
                    )}
                    {!tileComplete && checkableItems.length > 0 && (
                      <span
                        className="ml-auto text-md"
                        style={{ color: checklistDone ? "#00FF00" : "#00FFFF" }}
                      >
                        {tileChecked}/{required}
                      </span>
                    )}
                  </div>

                  {/* Item checkboxes */}
                  <div className="flex flex-col gap-1">
                    {(tile.items || []).map((item, rawIndex) => {
                      if (item === "OR") {
                        return (
                          <div
                            key={`or-${rawIndex}`}
                            className="font-bold italic underline"
                            style={{ color: "white", listStyle: "none", paddingLeft: "4px" }}
                          >
                            OR
                          </div>
                        );
                      }
                      if (item === "Choose 3:") {
                        return (
                          <div
                            key={`h-${rawIndex}`}
                            className="text-md"
                            style={{ color: "white", paddingLeft: "4px" }}
                          >
                            Choose 3:
                          </div>
                        );
                      }

                      // figure out the checkable index (skip OR / Choose 3:)
                      const checkableIndex = (tile.items || [])
                        .slice(0, rawIndex + 1)
                        .filter(i => i !== "OR" && i !== "Choose 3:")
                        .length - 1;

                      const key = `${tileIndex}-${checkableIndex}`;
                      const isChecked = !!checkedItems[key];

                      return (
                        <label
                          key={key}
                          className="flex items-center gap-2 cursor-pointer group"
                          style={{ userSelect: "none" }}
                        >
                          <div
                            onClick={() => toggleItem(tileIndex, checkableIndex)}
                            style={{
                              width: "16px",
                              height: "16px",
                              minWidth: "16px",
                              border: `2px solid ${isChecked ? "#00FF00" : "#694D23"}`,
                              backgroundColor: isChecked ? "#00AA00" : "transparent",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                          >
                            {isChecked && (
                              <span style={{ color: "#0F0F0F", fontSize: "14px", fontWeight: "bold" }}>✓</span>
                            )}
                          </div>
                          <span
                            onClick={() => toggleItem(tileIndex, checkableIndex)}
                            className="text-md"
                            style={{
                              color: isChecked ? "#888" : "#FFCF3F",
                              textDecoration: isChecked ? "line-through" : "none",
                              transition: "all 0.15s",
                            }}
                          >
                            {item}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;