//
// Home Page
//

"use client";

import { useState } from "react";
import Hero from "@/sections/hero";
import MyCode from "@/sections/myCode";
import Statistics from "@/sections/statistics";
import Footer from "@/sections/footer";

export default function HomePage() {

  return(
    <>
      <Hero />
      <MyCode />
      <Statistics />
      <Footer />
    </>
    
  );
};