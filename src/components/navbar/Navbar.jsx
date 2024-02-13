/** @format */
import Link from "next/link";
import Links from "./links/Link";
import styles from "./navbar.module.css";

const Navbar = () => {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <Link href="/">Audio Embedly</Link>
      </div>
      <div>
        <Links />
      </div>
    </div>
  );
};

export default Navbar;
