<template>
    <div class="com-container" @dblclick="revertMap">
        <div class="com-chart" ref="mapRef"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, shallowRef, computed, inject,onBeforeMount} from 'vue';
import { http } from '@/utils/http'
import { getProvinceMapInfo } from '@/utils/map_utils'
import axios from 'axios';
import { useThemeStore } from '@/store/index';
const themeStore = useThemeStore()
themeStore.$subscribe((mutation, state)=>{
    chartInstance.value.dispose()//销毁当前图表
    initChart()//重新以最新主题更换图表对象
    screenAdapter()//完成屏幕适配
    updateChart()
})
const socket = inject('socket')
const mapRef = ref()
const chartInstance = shallowRef(null)
const titleFontSize = ref(0)
const allData = ref()
//所获取的省份的地图矢量数据
const mapData = ref({})
const initChart = async () => {
    chartInstance.value = echarts.init(mapRef.value, themeStore.theme)
    const ret = await axios.get('http://localhost:8999/map/china.json')
    echarts.registerMap('china', ret.data)
    const option = {
        title: {
            text: '| 商家分布',
            left: 20,
            top: 20
        },
        legend: {
            left: '5%',
            bottom: '5%',
            orient: 'vertical'
        },
        geo: {
            type: 'map',
            map: 'china',
            top: '5%',
            bottom: '5%',
            itemStyle: {
                areaColor: '#2172bf',
                borderColor: '#333'
            }
        }
    }
    chartInstance.value.setOption(option)
    chartInstance.value.on('click', async (arg) => {
        const provinceInfo = getProvinceMapInfo(arg.name)
        //判断当前所点击的这个省份的地图矢量数据是否在mapData存在
        if (mapData.value[provinceInfo.key]) {
            const ret = await axios.get(`http://localhost:8999/${provinceInfo.path}`)
            mapData.value[provinceInfo.key] = ret.data
            echarts.registerMap(provinceInfo.key, ret.data)
        }
        const changeOption = {
            geo: {
                map: provinceInfo.key
            }
        }
        chartInstance.value.setOption(changeOption)
    })
}
const getData = async (ret) => {
    //const { data: ret } = await http.get('map')
    allData.value = ret
    console.log(ret);
    updateChart()
}
const updateChart = () => {
    const legendArr = allData.value.map(item => {
        return item.name
    })
    const seriesArr = allData.value.map(item => {
        return {
            type: 'effectScatter',
            rippleEffect: {
                scale: 5,
                brushType: 'stroke'
            },
            name: item.name,
            data: item.children,
            coordinateSystem: 'geo'
        }
    })
    const dataOption = {
        legend: {
            data: legendArr,
        },
        series: seriesArr
    }
    chartInstance.value.setOption(dataOption)
}
const screenAdapter = () => {
    titleFontSize.value = mapRef.value.offsetWidth / 100 * 3.6
    const adapterOption = {
        title: {
            textStyle: {
                fontSize: titleFontSize.value
            }
        },
        legend: {
            itemWidth: titleFontSize.value / 2,
            itemHeight: titleFontSize.value / 2,
            itemGap: titleFontSize.value / 2,
            textStyle: {
                fontSize: titleFontSize.value / 2
            }
        }
    }
    chartInstance.value.setOption(adapterOption)
    chartInstance.value.resize()
}
const revertMap = () => {
    const revertOption = {
        geo: {
            map: 'china'
        }
    }
    chartInstance.value.setOption(revertOption)
}
onBeforeMount(() => {
    socket.registerCallBack('mapData',getData)
})
onMounted(() => {
    initChart()
    // getData()
    socket.send({
        action:'getData',
        socketType:'mapData',
        chartName:'map',
        value:''
    })
    window.addEventListener('resize', screenAdapter)
    screenAdapter()
})
onBeforeUnmount(() => {
    window.removeEventListener('resize', screenAdapter)
    socket.unRegisterCallBack('mapData')
})
defineExpose({screenAdapter})
</script>

<style scoped lang="scc">
</style>