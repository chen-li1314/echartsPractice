<template>
    <div class="screen-container" :style="containerStyle">
        <header class="screen-header">
            <div>
                <img :src="headerSrc" alt="">
            </div>
            <span class="logo">
                <img :src="logoSrc" alt="" />
            </span>
            <span class="title">电商平台实时监控系统</span>
            <div class="title-right">
                <img :src="themeSrc" class="qiehuan" @click="handleChangeTheme">
                <span class="datetime">{{ nowTime }}</span>
            </div>
        </header>
        <div class="screen-body">
            <section class="screen-left">
                <div id="left-top" :class="[fullScreenStatus.trend ? 'fullscreen' : '']">
                    <!-- 销量趋势图表 -->
                    <Trend ref="trend"></Trend>
                    <div class="resize">
                        <!-- icon-compress-alt -->
                        <span @click="changeSize('trend')"
                            :class="['iconfont', fullScreenStatus.trend ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
                    </div>
                </div>
                <div id="left-bottom" :class="[fullScreenStatus.seller ? 'fullscreen' : '']">
                    <!-- 商家销售金额图表 -->
                    <Seller ref="seller"></Seller>
                    <div class="resize">
                        <!-- icon-compress-alt -->
                        <span @click="changeSize('seller')"
                            :class="['iconfont', fullScreenStatus.seller ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
                    </div>
                </div>
            </section>
            <section class="screen-middle">
                <div id="middle-top" :class="[fullScreenStatus.map ? 'fullscreen' : '']">
                    <!-- 商家分布图表 -->
                    <Map ref="map"></Map>
                    <div class="resize">
                        <!-- icon-compress-alt -->
                        <span @click="changeSize('map')"
                            :class="['iconfont', fullScreenStatus.map ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
                    </div>
                </div>
                <div id="middle-bottom" :class="[fullScreenStatus.rank ? 'fullscreen' : '']">
                    <!-- 地区销量排行图表 -->
                    <Rank ref="rank"></Rank>
                    <div class="resize">
                        <!-- icon-compress-alt -->
                        <span @click="changeSize('rank')"
                            :class="['iconfont', fullScreenStatus.rank ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
                    </div>
                </div>
            </section>
            <section class="screen-right">
                <div id="right-top" :class="[fullScreenStatus.hot ? 'fullscreen' : '']">
                    <!-- 热销商品占比图表 -->
                    <Hot ref="hot"></Hot>
                    <div class="resize">
                        <!-- icon-compress-alt -->
                        <span @click="changeSize('hot')"
                            :class="['iconfont', fullScreenStatus.hot ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
                    </div>
                </div>
                <div id="right-bottom" :class="[fullScreenStatus.stock ? 'fullscreen' : '']">
                    <!-- 库存销量分析图表 -->
                    <Stock ref="stock"></Stock>
                    <div class="resize">
                        <!-- icon-compress-alt -->
                        <span @click="changeSize('stock')"
                            :class="['iconfont', fullScreenStatus.stock ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>
  
<script setup>
import Hot from '@/components/Hot.vue'
import Map from '@/components/Map.vue'
import Rank from '@/components/Rank.vue'
import Seller from '@/components/Seller.vue'
import Stock from '@/components/Stock.vue'
import Trend from '@/components/Trend.vue'
import {useThemeStore} from '@/store/index'
import { formateDate } from '@/utils/Date'
import { computed, inject, nextTick, onBeforeMount, onMounted, onUnmounted, reactive, ref } from 'vue'
import {getThemeValue} from '@/utils/theme_utils'
const socket = inject('socket')
// 定义每一个图表的全屏状态
const fullScreenStatus = reactive({
    trend: false,
    seller: false,
    map: false,
    rank: false,
    hot: false,
    stock: false
})
const trend = ref(null)
const seller = ref(null)
const map = ref(null)
const rank = ref(null)
const hot = ref(null)
const stock = ref(null)
const refs = {
    trend,
    seller,
    map,
    rank,
    hot,
    stock
}
const nowTime = ref("")
const logoSrc = computed(()=>{
    return '/img/'+getThemeValue(themeStore.theme).logoSrc
})
const headerSrc = computed(()=>{
    return '/img/'+getThemeValue(themeStore.theme).headerSrc
})
const themeSrc = computed(()=>{
    return '/img/'+getThemeValue(themeStore.theme).themeSrc
})
const containerStyle = computed(()=>{
    return {
        backgroundColor:getThemeValue(themeStore.theme).backgroundColor,
        color:getThemeValue(themeStore.theme).titleColor,
    }   
})
const themeStore = useThemeStore()
const changeSize = (chartName) => {
    // fullScreenStatus[chartName] = !fullScreenStatus[chartName]
    // nextTick(() => {
    //     refs[chartName].value.screenAdapter()
    // })
    const targetValue = !fullScreenStatus[chartName]
    socket.send({
        action:'fullScreen',
        socketType:'fullScreen',
        chartName,
        value:targetValue
    })
}
//接受到全屏数据之后的处理
const recvData = (data)=>{
    //取出什么图标要切换
    const chartName = data.chartName
    //切换成什么状态
    const targetValue = data.value
    fullScreenStatus[chartName] = targetValue
    nextTick(()=>{
        refs[chartName].value.screenAdapter()
    })
    console.log(666);
}

const recvThemeChange = ()=>{
    themeStore.changeTheme()
}

const handleChangeTheme = ()=>{
    //修改pinia中的数据
    // themeStore.changeTheme()
    socket.send({
        action:'themeChange',
        socketType:'themeChange',
        chartName:'',
        value:''
    })
}
onBeforeMount(()=>{
    socket.registerCallBack('fullScreen',recvData)
    socket.registerCallBack('themeChange',recvThemeChange)
})
onMounted(() => {
    setInterval(() => {
        nowTime.value = formateDate(new Date())
    })
})
onUnmounted(()=>{
    socket.unRegisterCallBack('fullScreen')
    socket.unRegisterCallBack('themeChange')
})
</script>
<style lang="scss" scoped>
// 全屏样式的定义
.fullscreen {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    z-index: 100;
}

.screen-container {
    width: 100%;
    height: 100%;
    padding: 0 20px;
    background-color: #161522;
    color: #fff;
    box-sizing: border-box;
}

.screen-header {
    width: 100%;
    height: 64px;
    font-size: 20px;
    position: relative;

    >div {
        img {
            width: 100%;
        }
    }

    .title {
        position: absolute;
        left: 50%;
        top: 50%;
        font-size: 20px;
        transform: translate(-50%, -50%);
    }

    .title-right {
        display: flex;
        align-items: center;
        position: absolute;
        right: 0px;
        top: 50%;
        transform: translateY(-80%);
    }

    .qiehuan {
        width: 28px;
        height: 21px;
        cursor: pointer;
    }

    .datetime {
        font-size: 15px;
        margin-left: 10px;
    }

    .logo {
        position: absolute;
        left: 0px;
        top: 50%;
        transform: translateY(-80%);

        img {
            height: 35px;
            width: 128px;
        }
    }
}

.screen-body {
    width: 100%;
    height: 100%;
    display: flex;
    margin-top: 10px;

    .screen-left {
        height: 100%;
        width: 27.6%;

        #left-top {
            height: 56%;
            position: relative;
        }

        #left-bottom {
            height: 28%;
            margin-top: 25px;
            position: relative;
        }
    }

    .screen-middle {
        height: 100%;
        width: 41.5%;
        margin-left: 1.6%;
        margin-right: 1.6%;

        #middle-top {
            width: 100%;
            height: 56%;
            position: relative;
        }

        #middle-bottom {
            margin-top: 25px;
            width: 100%;
            height: 28%;
            position: relative;
        }
    }

    .screen-right {
        height: 100%;
        width: 27.6%;

        #right-top {
            height: 56%;
            position: relative;
        }

        #right-bottom {
            height: 28%;
            margin-top: 25px;
            position: relative;
        }
    }
}

.resize {
    position: absolute;
    right: 20px;
    top: 20px;
    cursor: pointer;
}
</style>
  