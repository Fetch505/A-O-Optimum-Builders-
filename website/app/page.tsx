import CardSection from "@/components/user/home/cardSection";
import Exposure from "@/components/user/home/exposure";
import Hero from "@/components/user/home/hero";
import FaqSection from "@/components/user/home/faqSection";
const Home=()=> {
  return (
  <>
  <Hero />
  <Exposure />
  <CardSection service={true} />
  <CardSection service={false} />
  <FaqSection />

  </>
  );
}
export default Home