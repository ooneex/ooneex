import { Ooneex } from "./icons/Ooneex";

export const MailerLayoutHeader = ({
  children,
  backgroundColor = "#432371",
}: {
  children?: React.ReactNode;
  backgroundColor?: string;
}): React.JSX.Element => {
  return (
    <div
      style={{
        backgroundColor,
        width: "100%",
        padding: "20px",
        textAlign: "center",
      }}
    >
      {children ?? <Ooneex />}
    </div>
  );
};
