export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.meta.layout !== 'front') return;

  const {$auth} = useNuxtApp();
  $auth.headers.set("aslan", "sdsds")
  console.log($auth.headers.get('aslan'))
  console.log($auth.strategy)

});
