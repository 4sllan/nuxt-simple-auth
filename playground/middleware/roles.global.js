export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.meta.layout !== 'front') return;

  const {$auth} = useNuxtApp();

  console.log($auth)


  $auth.headers.set("X-CSRF-TOKEN", "1yU9bPrjspLF9FS7SMPah5O7KXWMA")
  console.log($auth.headers, 'middleware')
  console.log($auth.headers.get("X-CSRF-TOKEN"), 'middleware')
  console.log($auth.strategy, 'middleware')
  console.log($auth.prefix, 'middleware')

});
