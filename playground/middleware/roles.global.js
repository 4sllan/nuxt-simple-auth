export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.meta.layout !== 'front') return;

  const {$auth} = useNuxtApp();
  setTimeout(() => {
    console.log($auth.user)
  }, 600)

});
