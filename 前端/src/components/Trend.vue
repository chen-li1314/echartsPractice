<template>
    <div class="com-container">
        <div class="title" :style="comStyle">
            <span :style="marginStyle">{{showTitle }}</span>
            <span class="iconfont title-icon" :style="comStyle" @click="showChoice = !showChoice">&#xe6eb;</span>
            <div class="select-con" v-show="showChoice" :style="marginStyle">
                <div class="select-item" v-for="item in selectTypes" :key="item.key" @click="handleSelect(item.key)">
                    {{ item.text }}
                </div>
            </div>
        </div>
        <div class="com-chart" ref="trendRef"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, shallowRef, computed,inject,onBeforeMount } from 'vue';
import { http } from '@/utils/http'
import {getThemeValue} from '@/utils/theme_utils'
import { useThemeStore } from '@/store/index';
const themeStore = useThemeStore()
const socket = inject('socket')
const trendRef = ref()
const chartInstance = shallowRef(null)
const allData = ref()
//是否显示可选项
const showChoice = ref(false)
//显示数据的类型
const choiceType = ref('map')
//字体大小
const titleFontSize = ref(0)
themeStore.$subscribe((mutation, state)=>{
    chartInstance.value.dispose()//销毁当前图表
    initChart()//重新以最新主题更换图表对象
    screenAdapter()//完成屏幕适配
    updateChart()
})
const selectTypes = computed(() => {
    if (!allData.value) {
        return []
    }
    else {
        return allData.value.type.filter(item => {
            return item.key !== choiceType.value
        })
    }
})
const showTitle = computed(() => {
    if (!allData.value) {
        return ''
    } else {
        return '|'+ allData.value[choiceType.value].title
    }
})
//设置给标题的样式
const comStyle = computed(() => {
    return {
        fontSize: titleFontSize.value + 'px',
        color:getThemeValue(themeStore.theme).titleColor
    }
})
const marginStyle = computed(() => {
    return {
        marginLeft: titleFontSize.value + 'px'
    }
})
const handleSelect = (currentType) => {
    choiceType.value = currentType
    updateChart()
    showChoice.value = false
}
const initChart = () => {
    chartInstance.value = echarts.init(trendRef.value, themeStore.theme)
    const option = {
        grid: {
            left: '3%',
            top: '35%',
            right: '4%',
            bottom: '1%',
            containLabel: true
        },
        tooltip: {
            trigger: 'axis',
        },
        legend: {
            left: 20,
            top: '15%',
            icon: 'circle',
        },
        xAxis: {
            type: 'category',
            boundaryGap: false
        },
        yAxis: {
            type: 'value'
        }
    }
    chartInstance.value.setOption(option)
}
const getData = async (ret) => {
    //const { data: ret } = await http.get('trend')
    allData.value = ret
    console.log(ret);
    updateChart()
}
const updateChart = () => {
    const colorArr1 = [
        'rgba(11, 168, 44, 0.5)',
        'rgba(44, 110, 255, 0.5)',
        'rgba(22, 242, 217, 0.5)',
        'rgba(254, 33, 30, 0.5)',
        'rgba(250, 105, 0, 0.5)'
    ]
    // 全透明的颜色值
    const colorArr2 = [
        'rgba(11, 168, 44, 0)',
        'rgba(44, 110, 255, 0)',
        'rgba(22, 242, 217, 0)',
        'rgba(254, 33, 30, 0)',
        'rgba(250, 105, 0, 0)'
    ]
    //类目轴的数据
    const timeArr = allData.value.common.month
    //series的数据
    const valueArr = allData.value[choiceType.value].data
    const seriesArr = valueArr.map((item, index) => {
        return {
            name: item.name,
            type: 'line',
            data: item.data,
            stack: choiceType.value,
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: colorArr1[index] },
                    { offset: 1, color: colorArr2[index] }
                ])
            }
        }
    })
    //图例的shuju
    const legendArr = valueArr.map(item => item.name)
    const dataOption = {
        xAxis: {
            data: timeArr
        },
        legend: {
            data: legendArr
        },
        series: seriesArr
    }
    chartInstance.value.setOption(dataOption)
}
const screenAdapter = () => {
    titleFontSize.value = trendRef.value.offsetWidth / 100 * 3.6
    const adapterOption = {
        legend:{
            itemWidth:titleFontSize.value,
            itemHeight:titleFontSize.value,
            itemGap:titleFontSize.value,
            textStyle:{
                fontSize:titleFontSize.value/2,
            }
        }
    }
    chartInstance.value.setOption(adapterOption)
    chartInstance.value.resize()
}
onBeforeMount(() => {
    socket.registerCallBack('trendData',getData)
})
onMounted(() => {
    initChart()
    //getData()
    socket.send({
        action:'getData',
        socketType:'trendData',
        chartName:'trend',
        value:''
    })
    window.addEventListener('resize', screenAdapter)
    screenAdapter()
})
onBeforeUnmount(() => {
    window.removeEventListener('resize', screenAdapter)
    socket.unRegisterCallBack('trendData')
})
defineExpose({screenAdapter})
</script>

<style scoped lang="scss">
.title {
    position: absolute;
    left: 20px;
    top: 20px;
    z-index: 10;
    color: white;

    .title-icon {
        margin-left: 10px;
        cursor: pointer;
    }
    .select-con{
        background-color: rgba(41,52,65,1);
    }
}
</style>