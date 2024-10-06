import { useDrag, useDrop } from "react-dnd";
import Square from "./square";

const ItemTypes = {
  SQUARE: "square",
};

const MovableSquare = ({
  frontValue,
  backValue,
  onClick,
  index,
  moveSquare,
  flipped,
}) => {
  const [{ isDraggingTile }, drag] = useDrag({
    type: ItemTypes.SQUARE,
    item: { index },
    collect: (monitor) => ({
      isDraggingTile: !!monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.SQUARE,
    drop: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveSquare(draggedItem.index, index);
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={{
        opacity: isDraggingTile ? 0.5 : 1,
      }}
      onClick={() => onClick(index)}
    >
      <Square value={flipped ? backValue : frontValue} />
    </div>
  );
};

export default MovableSquare;
