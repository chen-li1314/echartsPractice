<template>
    <div class="com-container">
        <div class="com-chart" ref="hotRef"></div>
        <span class="iconfont arr-left" @click="toLeft" :style="comStyle">&#xe6ef;</span>
        <span class="iconfont arr-right" @click="toRight" :style="comStyle">&#xe6ed;</span>
        <span class="cat-name" :style="comStyle">{{ catName }}</span>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, shallowRef, computed, inject, onBeforeMount} from 'vue';
import { http } from '@/utils/http'
import {getThemeValue} from '@/utils/theme_utils'
import { useThemeStore } from '@/store/index';
const themeStore = useThemeStore()
const socket = inject('socket')
const hotRef = ref()
const chartInstance = shallowRef(null)
const titleFontSize = ref(0)
const allData = ref()
const currentIndex = ref(0)
const catName = computed(() => {
    if (!allData.value) {
        return ''
    } else {
        return allData.value[currentIndex.value].name
    }
})
const comStyle = computed(() => {
    return {
        fontSize: titleFontSize.value + 'px',
        color:getThemeValue(themeStore.theme).titleColor
    }
})
themeStore.$subscribe((mutation, state)=>{
    chartInstance.value.dispose()//销毁当前图表
    initChart()//重新以最新主题更换图表对象
    screenAdapter()//完成屏幕适配
    updateChart()
})
const initChart = () => {
    chartInstance.value = echarts.init(hotRef.value, themeStore.theme)
    const option = {
        title: {
            text: '|热销商品占比',
            left: 20,
            top: 20
        },
        legend: {
            top: '15%',
            icon: 'circle'
        },
        tooltip: {
            show: true,
            formatter: (arg) => {
                const thirdCategory = arg.data.children
                //计算百分比
                let total = 0
                thirdCategory.forEach(item => {
                    total += item.value
                })
                let retStr = ''
                thirdCategory.forEach(item => {
                    retStr += `${item.name}:${parseInt(item.value / total * 100)}%</br>`
                })
                return retStr
            }
        },
        series: [
            {
                type: 'pie',
                label: {
                    show: false
                },
                emphasis: {
                    label: {
                        show: true
                    },
                    labelLine: {
                        show: false
                    }
                }
            }
        ]
    }
    chartInstance.value.setOption(option)
}
const getData = async (ret) => {
    //const { data: ret } = await http.get('hotproduct')
    allData.value = ret
    updateChart()
}
const updateChart = () => {
    const legendDate = allData.value[currentIndex.value].children.map(item => {
        return item.name
    })
    const seriesData = allData.value[currentIndex.value].children.map(item => {
        return {
            name: item.name,
            value: item.value,
            children: item.children
        }
    })
    const dataOption = {
        legend: {
            data: legendDate
        },
        series: [{
            data: seriesData
        }]
    }
    chartInstance.value.setOption(dataOption)
}
const screenAdapter = () => {
    titleFontSize.value = hotRef.value.offsetWidth / 100 * 3.6
    const adapterOption = {
        title: {
            textStyle: {
                fontSize: titleFontSize.value
            }
        },
        legend: {
            itemWidth: titleFontSize.value,
            itemHeight: titleFontSize.value,
            itemGap: titleFontSize.value / 2,
            textStyle: {
                fontSize: titleFontSize.value / 2
            }
        },
        series: [
            {
                radius: titleFontSize.value * 3.5,
                center: ['50%', '50%']
            }
        ]
    }
    chartInstance.value.setOption(adapterOption)
    chartInstance.value.resize()
}
const toLeft = () => {
    currentIndex.value--
    if (currentIndex.value < 0) {
        currentIndex.value = allData.value.length - 1
    }
    updateChart()
}
const toRight = () => {
    currentIndex.value++
    if (currentIndex.value > allData.value.length - 1) {
        currentIndex.value = 0
    }
    updateChart()
}
onBeforeMount(() => {
    socket.registerCallBack('hotData',getData)
})
onMounted(() => {
    initChart()
    //getData()
    //发生数据给服务器
    socket.send({
        action:'getData',
        socketType:'hotData',
        chartName:'hotproduct',
        value:''
    })
    window.addEventListener('resize', screenAdapter)
    screenAdapter()
})
onBeforeUnmount(() => {
    window.removeEventListener('resize', screenAdapter)
    socket.unRegisterCallBack('hotData')
})
defineExpose({screenAdapter})
</script>

<style scoped lang="scss">
.arr-left {
    position: absolute;
    left: 10%;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: white;
}

.arr-right {
    position: absolute;
    right: 10%;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: white;
}

.cat-name {
    position: absolute;
    left: 80%;
    bottom: 20px;
    color: white;
}
</style>