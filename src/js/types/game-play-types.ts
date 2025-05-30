export type FigurePositionInBoard = {
  position: number;
  character: { type: string; health: number; };
};

export type CellEventListener = (index: number) => void;
export type GameActionListener = () => void;
