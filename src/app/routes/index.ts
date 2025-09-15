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
    path: "/uploads",
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
    path: "/branches",
    route: branchRouter,
  },
  {
    path: "/customers",
    route: customerRouter,
  },
  {
    path: "/orders",
    route: orderRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
