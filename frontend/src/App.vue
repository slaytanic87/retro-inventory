<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import AddConsoleModal from './components/AddConsoleModal.vue'
import AddGameModal from './components/AddGameModal.vue'
import AppNav from './components/AppNav.vue'
import TickerBar from './components/TickerBar.vue'
import ToastStack from './components/ToastStack.vue'
import { useToasts } from './composables/useToasts'
import { useLibraryStore } from './stores/library'

const store = useLibraryStore()
const { push } = useToasts()

const showGameModal = ref(false)
const showConsoleModal = ref(false)

onMounted(() => store.fetchAll())

function onGameCreated(name: string) {
  push(`${name} added to the library.`)
}

function onConsoleCreated(name: string) {
  push(`${name} plugged into the collection.`)
}

function openGameModal() {
  if (!store.consoles.length) {
    push('Add a console first — every game needs a platform.', 'error')
    showConsoleModal.value = true
    return
  }
  showGameModal.value = true
}
</script>

<template>
  <AppNav @add-game="openGameModal" @add-console="showConsoleModal = true" />
  <TickerBar />

  <main>
    <RouterView v-slot="{ Component }">
      <component
        :is="Component"
        @add-game="openGameModal"
        @add-console="showConsoleModal = true"
      />
    </RouterView>
  </main>

  <footer class="footer">
    <p class="mono">
      Retro Inventory · demo build · data is mocked in the REST client, no backend attached
    </p>
  </footer>

  <AddGameModal
    v-if="showGameModal"
    @close="showGameModal = false"
    @created="onGameCreated"
  />
  <AddConsoleModal
    v-if="showConsoleModal"
    @close="showConsoleModal = false"
    @created="onConsoleCreated"
  />

  <ToastStack />
</template>

<style scoped>
.footer {
  border-top: 3px solid var(--hard);
  background: var(--bg-deep);
  padding: 18px 22px;
  text-align: center;
}

.footer p {
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--muted);
}
</style>
