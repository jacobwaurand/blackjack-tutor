<script setup lang="ts">
import type { Component } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    icon?: Component
    variant?: 'primary' | 'secondary' | 'tertiary'
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    disabled: false,
  },
)

const variantClasses: Record<string, string> = {
  primary: 'bg-primary hover:brightness-110 text-dark-bg',
  secondary: 'bg-secondary hover:brightness-110 text-dark-bg',
  tertiary: 'bg-tertiary hover:brightness-110 text-dark-bg',
}
</script>

<template>
  <button
    :disabled="props.disabled"
    :class="[variantClasses[props.variant]]"
    class="group relative m-1.5 flex min-w-28 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-md px-4 py-2 font-semibold shadow-md transition-all duration-150 outline-none active:scale-95 active:shadow-inner disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
    type="button"
  >
    <!-- shimmer sweep on hover -->
    <span
      class="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/15 transition-transform duration-500 group-hover:translate-x-[200%]"
    />
    <component :is="props.icon" v-if="props.icon" :size="18" :stroke-width="2.5" class="shrink-0" />
    <span>{{ props.label }}</span>
  </button>
</template>
