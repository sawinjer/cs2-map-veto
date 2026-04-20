import { TeamInfo } from "./team-info";

interface Props {
  whoPicked?: { name: string; logoUrl?: string };
}

export const PickBatch = (props: Props) => {
  const { whoPicked } = props;
  return (
    <>
      <div className="absolute top-0 left-0 w-full h-full bg-blue-500 opacity-15  flex items-center justify-center"></div>
      <div className="absolute top-1/2 left-1/2 -translate-1/2 z-50 flex flex-col items-center gap-4 w-full p-4">
        {whoPicked ? <TeamInfo {...whoPicked} /> : null}
        <h2 className="text-white bg-blue-400 text-2xl font-bold  p-4 rounded-md w-fit">
          PICKED
        </h2>
      </div>
    </>
  );
};
