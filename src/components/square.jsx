import utils from "../utils";

const Square = ({ value }) => (
  <div
    className="square"
    style={{
      backgroundImage: `url(${utils.getBaseURL()}/tiles/${value}.png)`,
      backgroundSize: "cover",
      backgroundColor: `hsl(${(value * 50) % 360}, 70%, 80%)`,
    }}
  />
);

export default Square;
