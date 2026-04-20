interface Props {
  name: string;
  logoUrl?: string;
}

export const TeamInfo = (props: Props) => {
  return (
    <span className="flex gap-1 bg-white text-black p-2 rounded-md  max-w-full w-fit flex-wrap items-center">
      {props.logoUrl && (
        <img
          src={props.logoUrl || "#"}
          alt="team logo"
          className="object-cover w-[50px] rounded-full aspect-square"
        />
      )}
      {props.name}
    </span>
  );
};
