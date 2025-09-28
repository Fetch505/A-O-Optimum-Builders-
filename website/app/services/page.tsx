
import Hero from "@/components/user/common/hero";
import CategorySection from "@/components/user/services/categoriesSection";
import MainSection from "@/components/user/services/mainSection";

const about =()=>{
  return (
  <>
 <Hero currentpage="services" />
 <CategorySection />
 
    <MainSection />
    
  </>

)}
export default about;