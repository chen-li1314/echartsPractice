import { createRouter, createWebHistory } from 'vue-router'
import SellerPage from '@/views/SellerPage.vue'
import TrendPage from '@/views/TrendPage.vue'
import MapPage from '@/views/MapPage.vue'
import RankPage from '@/views/RankPage.vue'
import StockPage from '@/views/StockPage.vue'
import HotPage from '@/views/HotPage.vue'
import ScreenPage from '@/views/ScreenPage.vue'

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path:'/',
            redirect:'/screen'
        },
        {
            path:'/screen',
            component:ScreenPage
        },
        {
            path: '/sellerpage',
            component: SellerPage
        },
        {
            path: '/trendPage',
            component: TrendPage
        },
        {
            path: '/mapPage',
            component: MapPage
        },
        {
            path: '/rankPage',
            component: RankPage
        },
        {
            path: '/hotPage',
            component: HotPage
        },
        {
            path: '/stockPage',
            component: StockPage
        },
    ],
    scrollBehavior() {
        return { top: 0 }
    }
})