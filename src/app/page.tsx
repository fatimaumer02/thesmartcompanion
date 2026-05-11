import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import LoginPage from "@/src/app/login/page";
import SignupPage from "@/src/app/signup/page";
import ProfileSetup from "@/src/app/profilesetup/page";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <LoginPage/>
      <SignupPage/>
      <ProfileSetup/>
    </main>
  );
}