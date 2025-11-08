import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { categoryRouter } from "../modules/category/category.routes";
import { bannerRouter } from "../modules/banner/banner.routes";
import { contractRouter } from "../modules/contact/contract.routes";
import { saveCardRouter } from "../modules/savecard/savecard.routes";
import { faqRouter } from "../modules/faq/faq.routes";
import { privacyPolicyRouter } from "../modules/privacy-policy/privacy-policy.routes";
import { TermsConditionRouter } from "../modules/terms-condition/terms-condition.routes";
import { helpSupportRouter } from "../modules/help-support/help-support.routes";
import { blogRouter } from "../modules/blog/blog.routes";
import { mealPlanRouter } from "../modules/meal-plan/mealPlan.routes";
import { customerRouter } from "../modules/customer/customer.routes";
import { orderRouter } from "../modules/order/order.routes";
import { uploadRouter } from "../modules/upload/upload.routes";
import { goalRouter } from "../modules/goal/goal.routes";
import { branchRouter } from "../modules/branch/branch.routes";
import { brandRouter } from "../modules/brand/brand.routes";
import { aggregatorRouter } from "../modules/aggregator/aggregator.routes";
import { paymentMethodRouter } from "../modules/payment-method/paymentMethod.routes";
import { moreOptionRouter } from "../modules/more-option/moreOption.routes";
import { dayCloseReportRouter } from "../modules/day-close-report/day-close-report.routes";
import { shiftRouter } from "../modules/shift/shift.routes";
import { menuCategoryRouter } from "../modules/menu-category/menuCategory.routes";
import { menuRouter } from "../modules/menu/menu.routes";
import userMembershipRouter from "../modules/user-membership/userMembership.routes";
import { includedRouter } from "../modules/included/included.routes";
import { counterPageRouter } from "../modules/counter-page/counterPage.routes";
import { compareRouter } from "../modules/compare/compare.routes";
import { testimonialRouter } from "../modules/testimonial/testimonial.routes";
import { mealPlanWorkRouter } from "../modules/meal-plan-work/mealPlanWork.routes";
import { whyChooseRouter } from "../modules/why-choose/whyChoose.routes";

const router = Router();
const moduleRoutes = [
  {
    path: "/auth",
    route: authRouter,
  },

  {
    path: "/categories",
    route: categoryRouter,
  },

  {
    path: "/contracts",
    route: contractRouter,
  },

  {
    path: "/banners",
    route: bannerRouter,
  },

  {
    path: "/save-cards",
    route: saveCardRouter,
  },

  {
    path: "/faqs",
    route: faqRouter,
  },

  {
    path: "/privacy-policy",
    route: privacyPolicyRouter,
  },

  {
    path: "/terms-conditions",
    route: TermsConditionRouter,
  },

  {
    path: "/help-support",
    route: helpSupportRouter,
  },

  {
    path: "/blogs",
    route: blogRouter,
  },

  {
    path: "/upload",
    route: uploadRouter,
  },

  {
    path: "/goals",
    route: goalRouter,
  },

  {
    path: "/meal-plans",
    route: mealPlanRouter,
  },
  {
    path: "/menu-categories",
    route: menuCategoryRouter,
  },
  {
    path: "/menus",
    route: menuRouter,
  },
  {
    path: "/branches",
    route: branchRouter,
  },
  {
    path: "/brands",
    route: brandRouter,
  },
  {
    path: "/aggregators",
    route: aggregatorRouter,
  },
  {
    path: "/payment-methods",
    route: paymentMethodRouter,
  },
  {
    path: "/more-options",
    route: moreOptionRouter,
  },
  {
    path: "/customers",
    route: customerRouter,
  },
  {
    path: "/orders",
    route: orderRouter,
  },

  {
    path: "/day-close-report",
    route: dayCloseReportRouter,
  },
  {
    path: "/shift",
    route: shiftRouter,
  },
  {
    path: "/user-memberships",
    route: userMembershipRouter,
  },
  {
    path: "/included",
    route: includedRouter,
  },
  {
    path: "/counter-page",
    route: counterPageRouter,
  },
  {
    path: "/compare",
    route: compareRouter,
  },
  {
    path: "/testimonials",
    route: testimonialRouter,
  },
  {
    path: "/meal-plan-work",
    route: mealPlanWorkRouter,
  },
  {
    path: "/why-choose",
    route: whyChooseRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
