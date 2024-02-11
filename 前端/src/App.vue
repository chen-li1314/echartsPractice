<template>
  <router-view></router-view>
</template>

<script setup>
import SocketService from './utils/socket_service'
import { provide } from 'vue';
SocketService.Instance.connect()
provide('socket',SocketService.Instance)
</script>

<style scoped>
</style>
