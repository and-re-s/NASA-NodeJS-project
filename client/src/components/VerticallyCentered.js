import { withStyles } from "arwes";

const styles = () => ({
  root: {
    margin: "auto auto 10%", // move 10% upper from the centered position set via grid & placeItems
    maxWidth: 800,
    display: "grid",
    placeItems: "center",
  },
  "@media (max-width: 800px)": {
    root: {
      margin: "0 12px",
    },
  },
});

const VericallyCentered = (props) => {
  const { classes, className, children, ...rest } = props;
  return (
    <div className={`${classes.root} ${className}`} {...rest}>
      {children}
    </div>
  );
};

export default withStyles(styles)(VericallyCentered);
