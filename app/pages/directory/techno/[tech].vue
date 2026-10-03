<script setup lang="ts">
import { queryString } from '~/utils/query'

const route = useRoute()
const tech = queryString(route.params.tech)
</script>

<template>
  <DirectoryLanding type="techno" :slug="tech" />
</template>
