<script setup>
const route = useRoute()
const router = useRouter()

</script>

<template>
  <v-app>
    <v-main>
      <div class="screen-middle">
        <div class="wrapper">
          <NuxtPage/>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
.screen-middle {
  .wrapper {
    @apply absolute w-full max-w-[640px];
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>