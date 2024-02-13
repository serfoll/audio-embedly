/** @format */
"use client";

import { useState } from "react";
import styles from "./links.module.css";
import NavLink from "./navLink/navLink";

const links = [
  { title: "Home", path: "/" },
  { title: "Projects", path: "/projects" },
];

const Links = () => {
  return (
    <div className={styles.links}>
      {links.map((link) => (
        <NavLink item={link} key={link.title} />
      ))}
    </div>
  );
};

export default Links;
