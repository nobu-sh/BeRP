/**
 * Partially Correct Typings For Packets Based Off The Proto.yml Files
 * 
 * There are most likely a lot of errors with things being incorrectly marked
 * as bigint or number etc.
 * 
 * Endian has wayyyyy too many datatypes and we got tired of looking them up
 * so we just played the guessing game.
 * 
 * Feel free to create pr's to fix this
 */

export interface login {
  protocol_version: number
  tokens: string[]
}
export interface server_to_client_handshake {
  token: string
}
export interface TexturePackInfos {
  uuid: string
  version: string
  size: bigint
  content_key: string
  sub_pack_name: string
  content_identity: string
  has_scripts: boolean
  rtx_enabled: boolean
}
export interface BehaviourPackInfos {
  uuid: string
  version: string
  size: bigint
  content_key: string
  sub_pack_name: string
  content_identity: string
  has_scripts: boolean
}
export interface resource_packs_info {
  must_accept: boolean
  has_scripts: boolean
  force_server_packs: boolean
  behaviour_packs: BehaviourPackInfos[]
  texture_packs: TexturePackInfos[]
}
export interface ResourcePackIdVersion {
  uuid: string
  version: string
  name: string
}
export interface resource_pack_stack {
  must_accept: boolean
  behavior_packs: ResourcePackIdVersion[]
  resource_packs: ResourcePackIdVersion[]
  game_version: string
  experiments: experiments[]
  experiments_previously_used: boolean
}
export interface play_status {
  status: 'login_success' | 'failed_client' | 'failed_spawn' | 'player_spawn' | 'failed_invalid_tenant' | 'failed_vanilla_edu' | 'failed_edu_vanilla' | 'failed_server_full'
}
export interface disconnect {
  hide_disconnect_reason: boolean
  message: string
}
export type gamemode = (
  'survival' | 'creative' | 'adventure' | 'survival_spectator' | 'creative_spectatot' | 'fallback'
)
export interface position {
  x: number
  y: number
  z: number
}
export interface rotation {
  x: number
  z: number
}
export interface gamerules {
  name: string
  editable: boolean
  type: string
  value: boolean
}
export interface experiments{
  name: string
  enabled: boolean
}
export interface itemstates {
  name: string
  runtime_id: number
  component_based: boolean
}
export interface start_game {
  entity_id: bigint
  runtime_entity_id: bigint
  player_gamemode: string
  player_position: position
  rotation: rotation
  seed: number
  biome_type: number
  biome_name: string
  dimension: number
  generator: number
  world_gamemode: string
  difficulty: number
  spawn_position: position
  achievements_disabled: boolean
  day_cycle_stop_time: number
  edu_offer: number
  edu_features_enabled: boolean
  edu_product_uuid: string
  rain_level: number
  lightning_level: number
  has_confirmed_platform_locked_content: boolean
  is_multiplayer: boolean
  broadcast_to_lan: boolean
  xbox_live_broadcast_mode: number
  platform_broadcast_mode: number
  enable_commands: boolean
  is_texturepacks_required: boolean
  gamerules: gamerules[]
  experiments: experiments[]
  experiments_previously_used: boolean
  bonus_chest: boolean
  map_enabled: boolean
  permission_level: number
  server_chunk_tick_range: number
  has_locked_behavior_pack: boolean
  has_locked_resource_pack: boolean
  is_from_locked_world_template: boolean
  msa_gamertags_only: boolean
  is_from_world_template: boolean
  is_world_template_option_locked: boolean
  only_spawn_v1_villagers: boolean
  game_version: string
  limited_world_width: number
  limited_world_length: number
  is_new_nether: boolean
  experimental_gameplay_override: boolean
  level_id: string
  world_name: string
  premium_world_template_id: string
  is_trial: boolean
  movement_authority: 'client' | 'server' | 'server_with_rewind'
  rewind_history_size: number
  server_authoritative_block_breaking: boolean
  current_tick: [bigint, bigint]
  enchantment_seed: number
  block_properties: Array<string>
  itemstates: itemstates[]
  multiplayer_correlation_id: string
  server_authoritative_inventory: boolean
  engine: string
}
export interface packet_resource_pack_client_response {
  response_status: 'none' | 'refused' | 'send_packs' | 'have_all_packs' | 'completed'
  resourcepackids: string[]
}
export interface text {
  type: 'raw' | 'chat' | 'translation' | 'popup' | 'jukebox_popup' | 'tip' | 'system' | 'whisper' | 'announcement' | 'json_whisper' | 'json'
  needs_translation: boolean
  source_name?: string
  message: string
  parameter?: string[]
  xuid: string
  platform_chat_id: string
}
export interface set_time {
  time: number
}
export interface Item {
  network_id: number
  count?: number
  metadata?: number
  has_stack_id?: number
  stack_id?: number
  block_runtime_id: number
}
export interface Link {
  ridden_entity_id: bigint
  rider_entity_id: bigint
  type: number
  immediate: boolean
  rider_initiated: boolean
}
export interface add_player {
  uuid: string
  username: string
  entity_id_self: bigint
  runtime_entity_id: bigint
  platform_chat_id: string
  position: position
  velocity: position
  pitch: number
  yaw: number
  head_yaw: number
  held_item: Item
  metadata: any
  flags: number
  command_permission: number
  action_permissions: number
  permission_level: number
  custom_stored_permissions: number
  user_id: number
  links: Link[]
  device_id: string
  device_os: number
}
export interface EntityAttributes {
  name: string
  min: number
  value: number
  max: number
}
export interface add_entity {
  entity_id_self: bigint
  runtime_entity_id: number
  entity_type: string
  position: position
  velocity: position
  pitch: number
  yaw: number
  head_yaw: number
  attributes: EntityAttributes
  metadata: any
  links: Link[]
}
export interface remove_entity {
  entity_id_self: bigint
}
export interface add_item_entity {
  entity_id_self: bigint
  runtime_entity_id: number
  item: Item
  position: position
  velocity: position
  metadata: any
  is_from_fishing: boolean
}
export interface take_item_entity {
  runtime_entity_id: number
  target: number
}
export interface Rotation {
  yaw: number
  pitch: number
  head_yaw: number
}
export interface move_entity {
  runtime_entity_id: number
  flags: number
  position: position
  rotation: Rotation
}
export interface move_player {
  runtime_id: number
  position: position
  pitch: number
  yaw: number
  head_yaw: number
  mode: 'normal' | 'reset' | 'teleport' | 'rotation'
  on_ground: boolean
  ridden_runtime_id: number
  cause?: 'unknown' | 'projectile' | 'chorus_fruit' | 'command' | 'behavior'
  source_entity_type?: string
  tick: number
}
export interface rider_jump {
  jump_strength: number
}
export interface update_block {
  position: position
  block_runtime_id: number
  flags: any
  layer: number
}
export interface add_painting {
  entity_id_self: bigint
  runtime_entity_id: number
  coordinates: position
  direction: number
  title: string
}
export interface tick_sync {
  request_time: bigint
  response_time: bigint
}
export interface level_sound_event_old {
  sound_id: number
  position: position
  block_id: number
  entity_type: number
  is_baby_mob: boolean
  is_global: boolean
}
export interface level_event {
  event: string
  position: position
  data: number
}
export interface block_event {
  position: position
  type: 'sound' | 'change_state'
  data: number
}
export interface entity_event {
  runtime_entity_id: bigint
  event_id: string
  data: number
}
export interface mob_effect {
  runtime_entity_id: bigint
  event_id: number
  effect_id: number
  amplifier: number
  particles: boolean
  duration: number
}
export interface PlayerAttributes {
  min: number
  max: number
  current: number
  default: number
  name: string
}
export interface update_attributes {
  runtime_entity_id: bigint
  attributes: PlayerAttributes[]
  tick: bigint
}
export interface TransactionLegacy {
  legacy_request_id: number
  legacy_transactions: number
  container_id?: number
  changed_slots?: number[]
  slot_id?: number
}
export interface TransactionActions {
  source_type: string
  inventory_id?: any
  flags?: number
  action?: number
  slot: number
  old_item: Item
  new_item: Item
}
export interface inventory_transaction {
  /**
   * Confused By This. Look Into It Later
   */
  transaction: any
}
export interface mob_equipment {
  runtime_entity_id: bigint
  item: Item
  slot: number
  selected_slot: number
  window_id: string
}
export interface mob_armor_equipment {
  runtime_entity_id: bigint
  helmet: Item
  chestplate: Item
  leggings: Item
  boots: Item
}
export interface interact {
  action_id: string
  target_entity_id: bigint
  position?: position
}
export interface block_pick_request {
  x: number
  y: number
  z: number
  add_user_data: boolean
  selected_slot: number
}
export interface player_action {
  runtime_entity_id: bigint
  action: string
  position: position
  face: number
}
export interface hurt_armor {
  health: number
}
export interface set_entity_data {
  runtime_entity_id: bigint
  metadata: any
  tick: number
}
export interface set_entity_motion {
  runtime_entity_id: bigint
  velocity: position
}
export interface set_entity_link {
  link: Link
}
export interface set_health {
  health: number
}
export interface set_spawn_position {
  spawn_type: string
  player_position: position
  dimension: number
  world_position: position
}
export interface animate {
  action_id: string
  runtime_entity_id: bigint
}
export interface on_screen_texture_animation {
  animation_type: number
}
export interface respawn {
  position: position
  state: number
  runtime_entity_id: bigint
}
export interface container_open {
  window_id: string
  window_type: string
  coordinates: position
  runtime_entity_id: bigint
}
export interface container_close {
  window_id: string
  server: boolean
}
export interface player_hotbar {
  selected_slot: number
  window_id: string
  select_slot: boolean
}
export interface inventory_content {
  window_id: string
  input: Item[]
}
export interface inventory_slot {
  window_id: string
  slot: number
  item: Item
}
export interface container_set_data {
  window_id: string
  property: number
  value: number
}
export interface PotionTypeRecipes {
  input_item_id: number
  input_item_meta: number
  ingredient_id: number
  ingredient_meta: number
  output_item_id: number
  output_item_meta: number
}
export interface PotionContainerChangeRecipes {
  input_item_id: number
  ingredient_id: number
  output_item_id: number
}
export interface crafting_data {
  recipes: any
  potion_type_recipes: PotionTypeRecipes
  potion_container_recipes: PotionContainerChangeRecipes
  is_clean: boolean
}
export interface crafting_event {
  window_id: string
  recipe_type: string
  recipe_id: string
  input: Item[]
  result: Item[]
}
export interface structure_block_update {
  position: position
  stucture_name: string
  data_field: string
  include_players: boolean
  show_bounding_box: boolean
  structure_block_type: number
  settings: any
  redstone_save_mode: number
  should_trigger: boolean
}
export interface show_store_offer {
  offer_id: string
  show_all: boolean
}
export interface purchase_receipt {
  receipts: Array<string>
}
export interface player_skin {
  uuid: string
  skin: any
  skin_name: string
  old_skin_name: string
  is_verified: boolean
}
export interface sub_client_loign {
  tokens: '["encapsulated", { "lengthType": "varint", "type": "LoginTokens" }]'
}
export interface web_socket_connection {
  server: string
}
export interface set_last_hurt_by {
  entity_type: number
}
export interface book_edit {
  type: 'replace_page' | 'add_page' | 'delete_page' | 'swap_pages' | 'sign'
  slot: number
  page_number?: number
  text?: string
  photo_name?: string
  page1?: number
  page2?: number
  title?: string
  author?: string
  xuid?: string
}
export interface npc_request {
  runtime_entity_id: bigint
  request_type: 'set_actions' | 'execute_action' | 'execute_closing_commands' | 'set_name' | 'set_skin' | 'set_interaction_text'
  command: string
  action_type: 'set_actions' | 'execute_action' | 'execute_closing_commands' | 'set_name' | 'set_skin' | 'set_interact_text' | 'execute_openining_commands' 
}
export interface photo_transfer {
  image_name: string
  image_data: string
  book_id: string
}
export interface modal_form_request {
  form_id: number
  data: string
}
export interface modal_form_response {
  form_id: number
  data: string
}
export interface server_settings_response {
  form_id: number
  data: string
}
export interface show_profile {
  xuid: string
}
export interface set_default_game_type {
  gamemode: gamemode
}
export interface remove_objective {
  objective_name: string
}
export interface set_display_objective {
  display_slot: string
  objective_name: string
  display_name: string
  criteria_name: string
  sort_order: number
}
export interface set_score {
  action: 'change' | 'remove'
  entries: any
}
export interface lab_table {
  action_type: 'combine' | 'react'
  position: position
  reaction_type: number
}
export interface update_block_synced {
  position: position
  block_runtime_id: number
  flags: any
  layer: number
  entity_unique_id: bigint
  transition_type: 'entity' | 'create' | 'destroy'
}
export interface move_entity_delta {
  runtime_entity_id: bigint
  flags: any
  x?: number
  y?: number
  z?: number
  rot_x?: number
  rot_y?: number
  rot_z?: number
}
export interface set_scoreboard_identity {
  action: 'register_identity' | 'clear_identity'
  entries: any
}
export interface set_local_player_as_initialized {
  runtime_entity_id: bigint
}
export interface network_stack_latency {
  timestamp: number
  needs_response: number
}
export interface script_custom_event {
  event_name: string
  event_data: string
}
export interface spawn_particle_effect {
  dimension: number
  entity_id: bigint
  position: position
  particle_nam: string
}
export interface available_entity_identifiers {
  nbt: any
}
export interface level_sound_event_v2 {
  sound_id: number
  position: position
  block_id: number
  entity_type: string
  is_baby_mob: boolean
  is_global: boolean
}
export interface network_chunk_publisher_update {
  coordinates: position
  radius: number
}
export interface biome_definition_list {
  nbt: any
}
export interface level_sound_event {
  sound_id: string
  position: position
  extra_data: number
  entity_type: string
  is_baby_mob: boolean
  is_blobal: boolean
}
export interface level_event_generic {
  event_id: number
  nbt: any
}
export interface lectern_update {
  page: number
  page_count: number
  position: position
  drop_book: boolean
}
export interface video_stream_connect {
  server_uri: string
  frame_send_frequency: number
  action: number
  resolution_x: number
  resoultion_y: number
}
export interface add_ecs_entity {
  network_id: bigint
}
export interface remove_ecs_entity {
  network_id: bigint
}
export interface client_cache_status {
  enabled: boolean
}
export interface map_create_locked_copy {
  original_map_id: bigint
  new_map_id: bigint
}
export interface structure_template_data_export_request {
  name: string
  position: position
  settings: any
  request_type: 'export_from_save' | 'export_from_load' | 'query_saved_structure'
}
export interface structure_template_data_export_response {
  name: string
  success: boolean
  nbt?: any
  response_type: 'export' | 'query'
}
export interface update_block_properties {
  nbt: any
}
export interface client_cache_blob_status {
  misses: number
  haves: number
  missing: any
  have: any
}
export interface client_cache_miss_response {
  blobs: Blob[]
}
export interface education_settings {
  CodeBuilderDefault: string
  CodeBuilderTitle: string
  CanResizeCodeBuilder: boolean
  HasOverrideURI: boolean
  OverrideURI?: string
  HasQuiz: boolean
}
export interface multiplayer_settings {
  action_type: 'enabled_multiplayer' | 'disabled_multiplayer' | 'refresh_join_code'
}
export interface settings_command {
  command_line: string
  suppress_output: boolean
}
export interface anvil_damage {
  damage: number
  position: position
}
export interface completed_using_item {
  used_item_id: number
  use_method: 'equip_armor' | 'eat' | 'attack' | 'consume' | 'throw' | 'shoot' | 'place' | 'fill_bottle' | 'fill_bucket' | 'pour_bucket' | 'use_tool' | 'interact' | 'retrieved' | 'dyed' | 'traded'
}
export interface network_settings {
  compression_threshold: number
}
export interface player_auth_input {
  pitch: number
  yaw: number
  position: position
  move_vector: rotation
  head_yaw: number
  input_data: any
  input_mode: 'unknown' | 'mouse' | 'touch' | 'game_pad' | 'motion_controller'
  player_mode: 'normal' | 'teaser' | 'screen' | 'viewer' | 'reality' | 'placement' | 'living_room' | 'exit_level' | 'exit_level_living_room' | 'num_modes'
  gaze_direction?: position
  tick: number
  delta: position
  transaction?: any
  item_stack_request?: any
  block_action?: any
}
export interface creative_content {
  items: items
}
export interface items {
  entry_id: number
  item: any
}
export interface player_enchant_options {
  options: any
}
export interface item_stack_request {
  requests: any
}
export interface item_stack_response {
  responses: any
}
export interface player_armor_damage {
  type: ArmorDamageType
  helmet_damage?: number
  chestplate_damage?: number
  leggings_damage?: number
  boots_damage?: number
}
export interface ArmorDamageType {
  flags: {
    head?: 0b1
    chest?: 0b10
    legs?: 0b100
    feet?: 0b1000
  }
}
export interface update_player_game_type {
  gamemode: gamemode
  player_unique_id: bigint
}
export interface position_tracking_db_request {
  action: 'query'
  tracking_id: number
}
export interface position_tracking_db_broadcast {
  broadcast_action: 'update' | 'destroy' | 'not_found'
  tracking_id: number
  nbt: any
}
export interface packet_violation_warning {
  violation_type: 'malformed'
  severity: 'warning' | 'final_warning' | 'terminating'
  packet_id: number
  reason: string
}
export interface motion_prediction_hints {
  entity_runtime_id: bigint
  velocity: position
  on_ground: boolean
}
export interface animate_entity {
  animation: string
  next_state: string
  stop_condition: string
  controller: string
  blend_out_time: number
  runtime_entity_ids: Array<bigint>
}
export interface camera_shake {
  intensity: number
  duration: number
  type: number
  action: 'add' | 'stop'
}
export interface player_fog {
  stack: string[number]
}
export interface correct_player_move_prediction {
  position: position
  delta: position
  on_ground: boolean
  tick: number
}
export interface item_component {
  entries: any
}
export interface filter_text_packet {
  text: string
  from_server: boolean
}
export interface debug_renderer {
  type: 'clear' | 'add_cube'
  text?: string
  position?: position
  red?: number
  green?: number
  blue?: number
  alpha?: number
  duration?: number
}
export interface sync_entity_property {
  nbt: any
}
export interface add_volume_entity {
  entity_id: bigint
  nbt: any
}
export interface remove_volume_entity {
  entity_id: bigint
}
export interface simulation_type {
  type: 'game' | 'editor' | 'test' | 'invalid'
}
export interface npc_dialogue {
  entity_id: bigint
  action_type: 'open' | 'close'
  dialogue: string
  screen_name: string
  npc_name: string
  action_json: string
}
export interface gui_data_pick_item {
  item_name: string
  item_effects: string
  hotbar_slot: number
}
export interface adventure_settings {
  flags: any
  command_permission: string
  action_permissions: any
  permission_level: string
  custom_stored_permissions: number
  user_id: number
}
export interface block_entity_data {
  position: position
  nbt: any
}
export interface player_input {
  motion_x: number
  motion_z: number
  jumping: boolean
  sneaking: boolean
}
export interface level_chunk {
  x: number
  z: number
  sub_chunk_count: number
  cache_enabled: boolean
  blobs: any
  payload: any
}
export interface set_commands_enabled {
  enabled: boolean
}
export interface set_difficulty {
  difficulty: number
}
export interface change_dimension {
  dimension: number
  position: position
  respawn: boolean
}
export interface set_player_game_type {
  gamemode: string
}
export interface player_list {
  records: any
}
export interface simple_event {
  event_type: number
}
export interface event {
  runtime_id: bigint
  event_type: string
  use_player_id: number
  event_data: any
}
export interface spawn_experience_orb {
  position: position
  count: number
}
export interface clientbound_map_item_data {
  map_id: bigint
  update_flags: any
  dimension: number
  locked: boolean
  included_in: number
  scale: any
  tracked: any
  texture: any
}
export interface map_info_request {
  map_id: bigint
}
export interface request_chunk_radius {
  chunk_radius: number
}
export interface chunk_radius_update {
  chunk_radius: number
}
export interface item_frame_drop_item {
  coordinates: position
}
export interface game_rules_changed {
  rules: any
}
export interface camera {
  camera_entity_unique_id: bigint
  target_player_unique_id: bigint
}
export interface boss_event {
  boss_entity_id: bigint
  type: string
  title?: string
  progress?: number
  screen_darkening?: number
  color?: number
  overlay?: number
  player_id?: bigint
}
export interface show_credits {
  runtime_entity_id: bigint
  status: number
}
export interface available_commands {
  values_len: number
  _enum_type?: any
  enum_values?: any
  suffixes: string[]
  enums: any[]
  command_data: any[]
  dynamic_enums: any[]
  enum_constraints: any[]
}
export interface command_request {
  command: string
  origin: {
    type: string
    uuid: string
    request_id: string
    player_entity_id?: number
  }
  interval: boolean
}
export interface command_block_update {
  is_block: boolean
  position?: position
  mode?: string
  needs_redstone?: boolean
  conditional?: boolean
  minecart_entity_runtime_id: bigint
  command: string
  last_output: string
  name: string
  should_track_output: boolean
  tick_delay: number
  execute_on_first_tick: boolean
}
export interface command_output {
  origin: {
    type: string
    uuid: string
    request_id: string
    player_entity_id?: number
  }
  output_type: string
  success_count: number
  output: any
  dataset?: any
}
export interface update_trade {
  window_id: string
  window_type: string
  size: number
  trade_tier: number
  villager_unique_id: bigint
  entity_unique_id: bigint
  display_name: string
  new_trading_ui: boolean
  economic_trades: boolean
  offers: string
}
export interface update_equipment {
  window_id: string
  window_type: string
  size: number
  entity_id: bigint
  inventory: any
}
export interface resource_pack_data_info {
  pack_id: string
  max_chunk_size: number
  chunk_count: number
  size: number
  hash: any
  is_premium: boolean
  pack_type: string
}
export interface resource_pack_chunk_data {
  pack_id: string
  chunk_index: number
  progress: number
  payload: any
}
export interface resource_pack_chunk_request {
  pack_id: string
  chunk_index: number
}
export interface transfer {
  server_address: string
  port: number
}
export interface play_sound {
  name: string
  coordinates: position
  volume: number
  pitch: number
}
export interface stop_sound {
  name: string
  stop_all: boolean
}
export interface set_title {
  type: string
  text: string
  fade_in_time: number
  stay_time: number
  fade_out_time: number
  xuid: string
  platform_online_id: string
}
export interface add_behavior_tree {
  behaviortree: string
}
