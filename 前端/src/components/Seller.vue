<!-- 横向柱状图 -->
<template>
    <div class="com-container">
        <div class="com-chart" ref="sellerRef"></div>
    </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, shallowRef,onBeforeMount ,inject} from 'vue';
import { http } from '@/utils/http'
import { useThemeStore } from '@/store/index';
const themeStore = useThemeStore()
const socket = inject('socket')
const sellerRef = ref()
const chartInstance = shallowRef(null)
//服务器返回的数据
const allData = ref(null)
//当前显示的页数
const currentPage = ref(1)
//一共多少页
const totalPage = ref(0)
//定时器标识
const timeId = ref()
themeStore.$subscribe((mutation, state)=>{
    chartInstance.value.dispose()//销毁当前图表
    initChart()//重新以最新主题更换图表对象
    screenAdapter()//完成屏幕适配
    updateChart()
})
//初始化echarts对象
const initChart = () => {
    chartInstance.value = echarts.init(sellerRef.value, themeStore.theme)
    chartInstance.value.on('mouseover', () => {
        clearInterval(timeId.value)
    })
    chartInstance.value.on('mouseout', () => {
        startInterval()
    })
    const option = {
        title: {
            text: '|商家销售统计',
            left: 20,
            top: 20
        },
        grid: {
            top: '20%',
            left: '3%',
            right: '6%',
            bottom: '3%',
            containLabel: true //距离包含坐标轴上的配置
        },
        xAxis: {
            type: 'value'
        },
        yAxis: {
            type: 'category',
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line',
                z: 0,
                lineStyle: {
                    type: 'solid',
                    color: 'gray',
                    opacity: 0.1,
                }
            }
        },
        series: [
            {
                type: 'bar',
                label: {
                    show: true,
                    position: 'right',
                    textStyle: {
                        color: 'white'
                    }
                },
                itemStyle: {
                    //指明颜色渐变的方向和不同百分比下颜色的值
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: '#5052EE' },
                        { offset: 1, color: '#AB6EE5' }
                    ])
                }
            }
        ]
    }
    chartInstance.value.setOption(option)
}
//获取服务器数据
const getData = async (ret) => {
    //const { data: ret } = await http.get('seller')
    allData.value = ret
    allData.value.sort((a, b) => {
        return a.value - b.value
    })
    //每五个元素一页
    totalPage.value = allData.value.length % 5 === 0 ? allData.value.length / 5 : allData.value.length / 5 + 1

    updateChart()
    //启动定时器
    startInterval()
}
//更新图表
const updateChart = () => {
    const showData = allData.value.slice((currentPage.value - 1) * 5, currentPage.value * 5)
    const sellerNames = showData.map((item) => {
        return item.name
    })
    const sellervalues = showData.map((item) => {
        return item.value
    })
    const dataOption = {
        yAxis: {
            data: sellerNames
        },
        series: [
            {
                data: sellervalues,
            }
        ]
    }
    chartInstance.value.setOption(dataOption)
}
const startInterval = () => {
    if (timeId.value) {
        clearInterval(timeId.value)
    }
    timeId.value = setInterval(() => {
        currentPage.value++
        if (currentPage.value > totalPage.value) {
            currentPage.value = 1
        }
        updateChart()
    }, 3000)
}
//屏幕适配
const screenAdapter = () => {
    // console.log(sellerRef.value.offsetWidth);
    const titleFontSize = sellerRef.value.offsetWidth / 100 * 3.6
    const adapterOption = {
        title: {
            textStyle: {
                fontSize: titleFontSize,
            },
        },
        tooltip: {
            axisPointer: {
                lineStyle: {
                    width: titleFontSize,
                }
            }
        },
        series: [
            {
                barWidth: titleFontSize,
                itemStyle: {
                    borderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0],
                }
            }
        ]
    }
    chartInstance.value.setOption(adapterOption)
    //手动调用resize才能产生效果
    chartInstance.value.resize()
}
onBeforeMount(() => {
    socket.registerCallBack('sellerData',getData)
})
onMounted(() => {
    initChart()
    //getData()
    socket.send({
        action:'getData',
        socketType:'sellerData',
        chartName:'seller',
        value:''
    })
    window.addEventListener('resize', screenAdapter)
    //数据加载完之后主动进行适配
    screenAdapter()
})
onBeforeUnmount(() => {
    clearInterval(timeId.value)
    window.removeEventListener('resize',screenAdapter)
    socket.unRegisterCallBack('sellerData')
})
defineExpose({screenAdapter})
</script>

<style scoped lang="scss"></style>