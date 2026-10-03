<script setup lang="ts">
import { queryString } from '~/utils/query'

const route = useRoute()
const city = queryString(route.params.city)
</script>

<template>
  <DirectoryLanding type="ville" :slug="city" />
</template>
