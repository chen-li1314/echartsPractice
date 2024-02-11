<template>
    <div class="com-container">
        <div class="com-chart" ref="stockRef"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, shallowRef, computed, inject,onBeforeMount } from 'vue';
import { http } from '@/utils/http'
import { useThemeStore } from '@/store/index';
const themeStore = useThemeStore()
const socket = inject('socket')
const stockRef = ref()
const chartInstance = shallowRef(null)
const titleFontSize = ref(0)
const allData = ref()
const currentIndex = ref(0)//当前显示的数据
const timeId = ref(null)
themeStore.$subscribe((mutation, state)=>{
    chartInstance.value.dispose()//销毁当前图表
    initChart()//重新以最新主题更换图表对象
    screenAdapter()//完成屏幕适配
    updateChart()
})
const initChart = () => {
    chartInstance.value = echarts.init(stockRef.value, themeStore.theme)
    const option = {
        title: {
            text: '| 库存和销量分析',
            left: 20,
            top: 20
        },
    }
    chartInstance.value.setOption(option)
    chartInstance.value.on('mouseout', () => { startInterval() })
    chartInstance.value.on('mouseover', () => { clearInterval(timeId.value) })
}
const getData = async (ret) => {
    //const { data: ret } = await http.get('stock')
    allData.value = ret
    console.log(ret);
    updateChart()
    startInterval()
}
const updateChart = () => {
    const centerArr = [
        ['18%', '40%'],
        ['50%', '40%'],
        ['82%', '40%'],
        ['34%', '75%'],
        ['66%', '75%'],
    ]
    const colorArr = [
        ['#4FF778', '#0BA82C'],
        ['#E5DD45', '#E8B11C'],
        ['#E8821C', '#E55445'],
        ['#5052EE', '#AB6EE5'],
        ['#23E5E5', '#2E72BF'],
    ]
    const start = currentIndex.value * 5
    const end = (currentIndex.value + 1) * 5
    const showData = allData.value.slice(start, end)
    const seriesArr = showData.map((item, index) => {
        return {
            type: 'pie',
            center: centerArr[index],
            emphasis: {
                scale: false,//关闭鼠标移入时的动画
            },
            label: {
                position: 'center',
                color: colorArr[index][0],
                show: true
            },
            data: [
                {
                    name: item.name + '\n\n' + item.sales,
                    value: item.sales,
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                            {
                                offset: 0,
                                color: colorArr[index][0]
                            },
                            {
                                offset: 1,
                                color: colorArr[index][1]
                            }
                        ])
                    }
                },
                {
                    label: {
                        show: false
                    },
                    value: item.stock,
                    itemStyle: {
                        color: '#333843'
                    }
                }
            ]
        }
    })
    console.log(seriesArr);
    const dataOption = {
        series: seriesArr
    }
    chartInstance.value.setOption(dataOption)
}
const screenAdapter = () => {
    titleFontSize.value = stockRef.value.offsetWidth / 100 * 3.6
    const innerRadius = titleFontSize.value * 2.8
    const outterRaduis = innerRadius * 1.125
    const adapterOption = {
        title: {
            textStyle: {
                fontSize: titleFontSize.value
            }
        },
        series: [
            {
                type: 'pie',
                radius: [outterRaduis, innerRadius],
                label: {
                    fontSize: titleFontSize.value / 2
                }
            },
            {
                type: 'pie',
                radius: [outterRaduis, innerRadius],
                label: {
                    fontSize: titleFontSize.value / 2
                }
            },
            {
                type: 'pie',
                radius: [outterRaduis, innerRadius],
                label: {
                    fontSize: titleFontSize.value / 2
                }
            },
            {
                type: 'pie',
                radius: [outterRaduis, innerRadius],
                label: {
                    fontSize: titleFontSize.value / 2
                }
            },
            {
                type: 'pie',
                radius: [outterRaduis, innerRadius],
                label: {
                    fontSize: titleFontSize.value / 2
                }
            },
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
        currentIndex.value++
        if (currentIndex.value > 1) {
            currentIndex.value = 0
        }
        updateChart()
    }, 3000)
}
onBeforeMount(() => {
    socket.registerCallBack('stockData',getData)
})
onMounted(() => {
    initChart()
    //getData()
    socket.send({
        action:'getData',
        socketType:'stockData',
        chartName:'stock',
        value:''
    })
    window.addEventListener('resize', screenAdapter)
    screenAdapter()
})
onBeforeUnmount(() => {
    window.removeEventListener('resize', screenAdapter)
    clearInterval(timeId.value)
    socket.unRegisterCallBack('stockData')
})
defineExpose({screenAdapter})
</script>

<style scoped lang="scc">
</style>