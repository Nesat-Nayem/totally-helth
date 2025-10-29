"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = require("../modules/auth/auth.routes");
const category_routes_1 = require("../modules/category/category.routes");
const banner_routes_1 = require("../modules/banner/banner.routes");
const contract_routes_1 = require("../modules/contact/contract.routes");
const savecard_routes_1 = require("../modules/savecard/savecard.routes");
const faq_routes_1 = require("../modules/faq/faq.routes");
const privacy_policy_routes_1 = require("../modules/privacy-policy/privacy-policy.routes");
const terms_condition_routes_1 = require("../modules/terms-condition/terms-condition.routes");
const help_support_routes_1 = require("../modules/help-support/help-support.routes");
const blog_routes_1 = require("../modules/blog/blog.routes");
const mealPlan_routes_1 = require("../modules/meal-plan/mealPlan.routes");
const customer_routes_1 = require("../modules/customer/customer.routes");
const order_routes_1 = require("../modules/order/order.routes");
const upload_routes_1 = require("../modules/upload/upload.routes");
const goal_routes_1 = require("../modules/goal/goal.routes");
const branch_routes_1 = require("../modules/branch/branch.routes");
const brand_routes_1 = require("../modules/brand/brand.routes");
const aggregator_routes_1 = require("../modules/aggregator/aggregator.routes");
const paymentMethod_routes_1 = require("../modules/payment-method/paymentMethod.routes");
const moreOption_routes_1 = require("../modules/more-option/moreOption.routes");
const day_close_report_routes_1 = require("../modules/day-close-report/day-close-report.routes");
const shift_routes_1 = require("../modules/shift/shift.routes");
const menuCategory_routes_1 = require("../modules/menu-category/menuCategory.routes");
const menu_routes_1 = require("../modules/menu/menu.routes");
const userMembership_routes_1 = __importDefault(require("../modules/user-membership/userMembership.routes"));
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/auth",
        route: auth_routes_1.authRouter,
    },
    {
        path: "/categories",
        route: category_routes_1.categoryRouter,
    },
    {
        path: "/contracts",
        route: contract_routes_1.contractRouter,
    },
    {
        path: "/banners",
        route: banner_routes_1.bannerRouter,
    },
    {
        path: "/save-cards",
        route: savecard_routes_1.saveCardRouter,
    },
    {
        path: "/faqs",
        route: faq_routes_1.faqRouter,
    },
    {
        path: "/privacy-policy",
        route: privacy_policy_routes_1.privacyPolicyRouter,
    },
    {
        path: "/terms-conditions",
        route: terms_condition_routes_1.TermsConditionRouter,
    },
    {
        path: "/help-support",
        route: help_support_routes_1.helpSupportRouter,
    },
    {
        path: "/blogs",
        route: blog_routes_1.blogRouter,
    },
    {
        path: "/upload",
        route: upload_routes_1.uploadRouter,
    },
    {
        path: "/goals",
        route: goal_routes_1.goalRouter,
    },
    {
        path: "/meal-plans",
        route: mealPlan_routes_1.mealPlanRouter,
    },
    {
        path: "/menu-categories",
        route: menuCategory_routes_1.menuCategoryRouter,
    },
    {
        path: "/menus",
        route: menu_routes_1.menuRouter,
    },
    {
        path: "/branches",
        route: branch_routes_1.branchRouter,
    },
    {
        path: "/brands",
        route: brand_routes_1.brandRouter,
    },
    {
        path: "/aggregators",
        route: aggregator_routes_1.aggregatorRouter,
    },
    {
        path: "/payment-methods",
        route: paymentMethod_routes_1.paymentMethodRouter,
    },
    {
        path: "/more-options",
        route: moreOption_routes_1.moreOptionRouter,
    },
    {
        path: "/customers",
        route: customer_routes_1.customerRouter,
    },
    {
        path: "/orders",
        route: order_routes_1.orderRouter,
    },
    {
        path: "/day-close-report",
        route: day_close_report_routes_1.dayCloseReportRouter,
    },
    {
        path: "/shift",
        route: shift_routes_1.shiftRouter,
    },
    {
        path: "/user-memberships",
        route: userMembership_routes_1.default,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
