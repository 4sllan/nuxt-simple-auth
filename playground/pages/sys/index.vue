<script setup>
definePageMeta({
  layout: "front",
  middleware: ['auth', '_2fa'],
})

const {$auth} = useNuxtApp()

console.log($auth, 'Page')

const store = useState("auth")

console.log(store, 'storePage')

$auth.headers.set('X-XSRF-TOKEN', '1yU9bPrjspLF9FS7SMPah5O7KXWMA')

console.log($auth.headers, 'Page')

const headers = $auth.headers.get('X-XSRF-TOKEN')

console.log(headers, 'Page')

const has2fa = $auth.headers.get('2fa')

console.log(has2fa, '2fa page')
</script>

<template>
  <div class="middle">
    <v-card width="640" elevation="6">
      <v-card-title>Page with authentication and middleware for route restriction.</v-card-title>
      <v-card-text>You are authenticated using the "{{ $auth.strategy }}" strategy.</v-card-text>
      <v-card-actions>
        <v-btn variant="tonal" block color="#4d7aca" @click="$auth.logout('local')">
          logout
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<style scoped>
.middle {
  @apply absolute top-[50%] left-[50%];
  transform: translate(-50%, -50%);
}
</style>