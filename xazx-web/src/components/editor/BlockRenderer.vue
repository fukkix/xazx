<script setup lang="ts">
import { computed } from 'vue'
import type { DocNode } from '@/types/editor'
import HeadingBlock from './blocks/HeadingBlock.vue'
import ParagraphBlock from './blocks/ParagraphBlock.vue'
import StepsBlock from './blocks/StepsBlock.vue'
import TableBlock from './blocks/TableBlock.vue'
import ImageBlock from './blocks/ImageBlock.vue'
import PathBlock from './blocks/PathBlock.vue'
import CalloutBlock from './blocks/CalloutBlock.vue'
import FeatureMatrixBlock from './blocks/FeatureMatrixBlock.vue'
import BlockActions from './BlockActions.vue'

const props = defineProps<{
  node: DocNode
  depth?: number
}>()

const depth = computed(() => props.depth || 0)
</script>

<template>
  <div :id="`block-${node.id}`" class="block-wrapper group relative">
    <BlockActions :node="node" />

    <HeadingBlock v-if="node.type === 'heading'" :node="node" :depth="depth" />
    <ParagraphBlock v-else-if="node.type === 'paragraph'" :node="node" />
    <StepsBlock v-else-if="node.type === 'steps'" :node="node" />
    <TableBlock v-else-if="node.type === 'table'" :node="node" />
    <ImageBlock v-else-if="node.type === 'image'" :node="node" />
    <PathBlock v-else-if="node.type === 'path'" :node="node" />
    <CalloutBlock v-else-if="node.type === 'callout'" :node="node" />
    <FeatureMatrixBlock v-else-if="node.type === 'feature-matrix'" :node="node" />
  </div>
</template>

<style scoped>
.block-wrapper {
  transition: background-color 0.15s;
}
.block-wrapper:hover {
  background-color: rgba(0, 0, 0, 0.01);
}
</style>
