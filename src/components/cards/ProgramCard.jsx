import { Card, useMediaQuery, breakpoints } from "@edx/paragon";

const ProgramCard = ({ mainImg, logoImg, title, subtitle }) => {
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.small.maxWidth });
  return (
    <Card isClickable style={{ width: isExtraSmall ? "100%" : "40%" }}>
      <Card.ImageCap
        src={mainImg}
        srcAlt="Card image"
        logoSrc={logoImg}
        logoAlt="Card logo"
      />
      <Card.Header title={title} subtitle={subtitle} />
    </Card>
  );
};
export default ProgramCard;
