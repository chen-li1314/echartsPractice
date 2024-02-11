<template>
    <div class="com-container">
        <div class="com-chart" ref="rankRef"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, shallowRef, computed, onBeforeMount, inject } from 'vue';
import { http } from '@/utils/http'
import { useThemeStore } from '@/store/index';
const themeStore = useThemeStore()
themeStore.$subscribe((mutation, state)=>{
    chartInstance.value.dispose()//销毁当前图表
    initChart()//重新以最新主题更换图表对象
    screenAdapter()//完成屏幕适配
    updateChart()
})
const socket = inject('socket')
const rankRef = ref()
const chartInstance = shallowRef(null)
const titleFontSize = ref(0)
const allData = ref()
//区域缩放的起点
const startValue = ref(0)
//区域缩放的终点
const endValue = ref(9)
const timeId = ref()
const initChart = () => {
    chartInstance.value = echarts.init(rankRef.value, themeStore.theme)
    const option = {
        title: {
            text: '|地区销售排行',
            left: 20,
            top: 20,
        },
        grid: {
            top: '40%',
            bottom: '5%',
            reight: '5%',
            left: '5%',
            containLabel: true
        },
        tooltip: {
            show: true
        },
        xAxis: {
            type: 'category'
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                type: 'bar'
            }
        ]
    }
    chartInstance.value.setOption(option)
    chartInstance.value.on('mouseover', () => { clearInterval(timeId.value) })
    chartInstance.value.on('mouseout', () => { startInterval() })
}
const getData = async (ret) => {
    //const { data: ret } = await http.get('rank')
    allData.value = ret
    allData.value.sort((a, b) => { return b.value - a.value })
    console.log(ret);
    updateChart()
    startInterval()
}
const updateChart = () => {
    const colorArr = [
        ['#0BA82C', '#4FF778'],
        ['#2E72BF', '#23E5E5'],
        ['#5052EE', '#AB6EE5']
    ]
    //所有省份所形成的数组
    const provinceArr = allData.value.map((item) => {
        return item.name
    })
    //每一个省份对应的销售金额
    const valueArr = allData.value.map((item) => {
        return item.value
    })
    const dataOption = {
        xAxis: {
            data: provinceArr
        },
        dataZoom: {
            startValue: startValue.value,
            endValue: endValue.value,
            show: false
        },
        series: [
            {
                data: valueArr,
                itemStyle: {
                    color: (arg) => {
                        let targetColorArr = null
                        if (arg.value > 300) {
                            targetColorArr = colorArr[0]
                        } else if (arg.value > 200) {
                            targetColorArr = colorArr[1]
                        } else {
                            targetColorArr = colorArr[2]
                        }
                        return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {
                                offset: 0,
                                color: targetColorArr[0]
                            },
                            {
                                offset: 1,
                                color: targetColorArr[1]
                            },
                        ])
                    }
                }
            }
        ]
    }
    chartInstance.value.setOption(dataOption)
}
const screenAdapter = () => {
    titleFontSize.value = rankRef.value.offsetWidth / 100 * 3.6
    const adapterOption = {
        title: {
            textStyle: {
                fontSize: titleFontSize.value
            }
        },
        series: [
            {
                barWidth: titleFontSize.value,
                itemStyle: {
                    borderRadius: [titleFontSize.value / 2, titleFontSize.value / 2, 0, 0]
                }

            }
        ]
    }
    chartInstance.value.setOption(adapterOption)
    chartInstance.value.resize()
}
const startInterval = () => {
    if (timeId.value) {
        clearInterval(timeId.value)
    }
    timeId.value = setInterval(() => {
        startValue.value++
        endValue.value++
        if (endValue.value > allData.value.length - 1) {
            startValue.value = 0
            endValue.value = 9
        }
        updateChart()
    }, 2000)
}
onBeforeMount(() => {
    socket.registerCallBack('rankData', getData)
})
onMounted(() => {
    initChart()
    //getData()
    socket.send({
        action: 'getData',
        socketType: 'rankData',
        chartName: 'rank',
        value: ''
    })
    window.addEventListener('resize', screenAdapter)
    screenAdapter()
})
onBeforeUnmount(() => {
    window.removeEventListener('resize', screenAdapter)
    clearInterval(timeId.value)
    socket.unRegisterCallBack('rankData')
})
defineExpose({screenAdapter})
</script>

<style scoped lang="scc">
</style>