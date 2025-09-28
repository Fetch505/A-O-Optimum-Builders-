import CardSection from "@/components/user/home/cardSection";
import Exposure from "@/components/user/home/exposure";
import Hero from "@/components/user/home/hero";
const Home=()=> {
  return (
  <>
  <Hero />
  <Exposure />
  <CardSection service={true} />
  <CardSection service={false} />

  </>
  );
}
export default Home