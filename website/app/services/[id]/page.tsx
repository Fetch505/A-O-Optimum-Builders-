
import Hero from "@/components/user/common/hero";
import CategorySection from "@/components/user/services/categoriesSection";
import MediaSection from "@/components/user/services/mediaSection";
import ServiceDetailsSection from "@/components/user/services/serviceDetailSection";
const ServiceDetail = () => {
  return (
    <>
      <Hero currentpage="services" />
      <CategorySection />
      <ServiceDetailsSection />
      <MediaSection/>

    </>

  )
}
export default ServiceDetail;