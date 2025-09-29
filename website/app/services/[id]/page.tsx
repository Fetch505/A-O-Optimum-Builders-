
import Hero from "@/components/user/common/hero";
import CategorySection from "@/components/user/services/categoriesSection";
import ServiceDetailsSection from "@/components/user/services/serviceDetailSection";
const ServiceDetail = () => {
  return (
    <>
      <Hero currentpage="services" />
      <CategorySection />
      <ServiceDetailsSection />

    </>

  )
}
export default ServiceDetail;