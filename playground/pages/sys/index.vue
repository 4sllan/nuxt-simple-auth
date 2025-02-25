<script setup>
definePageMeta({
  layout: "front",
  middleware: ['auth'],
})

const {$auth} = useNuxtApp()

// console.log($auth, '$auth')
//
// const store = useState("auth")
//
// console.log(store, 'store')
//
// $auth.$headers.set('test', 'test headers')
//
// console.log($auth.$headers)
//
// const headers = $auth.$headers.get('test')
//
// console.log(headers)

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