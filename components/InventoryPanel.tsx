'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Sword, Shield, Gem } from 'lucide-react';

interface BagItem {
  id: string;
  name: string;
  qty: number;
  effect?: string;
  description?: string;
  type: string;
}

interface EquippedGear {
  weapon: any;
  armor: any;
  accessory: any;
}

interface Inventory {
  gold: number;
  equipped: EquippedGear;
  bag: BagItem[];
}

interface InventoryPanelProps {
  inventory: Inventory | null;
  onItemAction?: (actionText: string) => void;
}

const TYPE_EMOJI: Record<string, string> = {
  consumable: '🧪',
  quest: '🔑',
  weapon: '⚔️',
  armor: '🛡️',
  misc: '📦',
};

function emoji(type: string): string {
  return TYPE_EMOJI[type.toLowerCase()] ?? '📦';
}

/* ── Loading Skeleton ─────────────────────────────────── */
function Skeleton() {
  return (
    <div className="glass-panel p-4 space-y-4 animate-pulse">
      <div className="h-6 w-36 rounded bg-white/5" />
      <div className="h-8 w-24 rounded bg-white/5" />
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-white/5" />
        ))}
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 rounded bg-white/5" />
        ))}
      </div>
    </div>
  );
}

/* ── Equipped Slot ────────────────────────────────────── */
function EquipSlot({
  label,
  icon: Icon,
  item,
  glowClass,
  emptyText,
  onClick,
}: {
  label: string;
  icon: typeof Sword;
  item: any;
  glowClass: string;
  emptyText: string;
  onClick?: () => void;
}) {
  const hasItem = item && item.name;

  return (
    <motion.div
      className={`flex flex-col items-center gap-1 p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-void-lighter)] ${
        hasItem ? glowClass + ' cursor-pointer' : ''
      }`}
      whileHover={hasItem ? { scale: 1.04 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={hasItem ? onClick : undefined}
    >
      <Icon
        className={`w-5 h-5 ${
          hasItem ? 'text-[var(--color-gold)]' : 'text-[var(--color-dim)]'
        }`}
      />
      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-dim)]">
        {label}
      </span>
      {hasItem ? (
        <>
          <span className="text-xs font-display font-semibold text-[var(--color-silver)] text-center leading-tight">
            {item.name}
          </span>
          {item.damage && (
            <span className="text-[10px] font-mono text-[var(--color-blood-light)]">
              DMG: {item.damage}
            </span>
          )}
          {item.ac_bonus != null && (
            <span className="text-[10px] font-mono text-[var(--color-cyber-light)]">
              AC: +{item.ac_bonus}
            </span>
          )}
          {item.effect && (
            <span className="text-[10px] font-mono text-[var(--color-arcane-light)]">
              {item.effect}
            </span>
          )}
        </>
      ) : (
        <span className="text-[10px] font-mono text-[var(--color-dim)] italic">
          {emptyText}
        </span>
      )}
    </motion.div>
  );
}

/* ── Main Component ───────────────────────────────────── */
export default function InventoryPanel({ inventory, onItemAction }: InventoryPanelProps) {
  const [selectedItem, setSelectedItem] = useState<BagItem | null>(null);

  if (!inventory) return <Skeleton />;

  return (
    <motion.div
      className="glass-panel p-4 flex flex-col gap-3 overflow-hidden h-full"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Header ─────────────────────────── */}
      <div className="flex items-center justify-between shrink-0">
        <h2 className="font-display text-lg font-bold text-[var(--color-silver)]">
          🎒 Inventory
        </h2>
        <motion.div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--color-gold-dark)]/40 bg-[var(--color-gold-glow)]"
          key={inventory.gold}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Coins className="w-4 h-4 text-[var(--color-gold)]" />
          <span className="font-mono font-bold text-sm text-[var(--color-gold-light)] text-glow-gold">
            {inventory.gold.toLocaleString()}
          </span>
        </motion.div>
      </div>

      {/* ── Equipped ───────────────────────── */}
      <div className="shrink-0">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-dim)] mb-1.5">
          Equipped
        </p>
        <div className="grid grid-cols-3 gap-2">
          <EquipSlot
            label="Weapon"
            icon={Sword}
            item={inventory.equipped.weapon}
            glowClass="glow-blood"
            emptyText="Empty"
            onClick={() => setSelectedItem({ ...inventory.equipped.weapon, type: 'weapon', id: 'equipped_weapon', qty: 1 })}
          />
          <EquipSlot
            label="Armor"
            icon={Shield}
            item={inventory.equipped.armor}
            glowClass="glow-cyber"
            emptyText="Empty"
            onClick={() => setSelectedItem({ ...inventory.equipped.armor, type: 'armor', id: 'equipped_armor', qty: 1 })}
          />
          <EquipSlot
            label="Accessory"
            icon={Gem}
            item={inventory.equipped.accessory}
            glowClass="glow-arcane"
            emptyText="Empty"
            onClick={() => setSelectedItem({ ...inventory.equipped.accessory, type: 'accessory', id: 'equipped_acc', qty: 1 })}
          />
        </div>
      </div>

      {/* ── Bag ────────────────────────────── */}
      <div className="flex flex-col min-h-0 flex-1">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-dim)] mb-1.5 shrink-0">
          Bag ({inventory.bag.length})
        </p>
        <div className="overflow-y-auto space-y-1 pr-1 flex-1 min-h-0">
          <AnimatePresence mode="popLayout">
            {inventory.bag.map((item) => (
              <motion.div
                key={item.id}
                className="item-card flex items-center gap-2 group relative cursor-pointer"
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                transition={{ duration: 0.25 }}
                whileHover={{ scale: 1.02, x: 4 }}
                onClick={() => setSelectedItem(item)}
              >
                <span className="text-base shrink-0">{emoji(item.type)}</span>
                <span className="text-xs font-body text-[var(--color-silver)] truncate flex-1">
                  {item.name}
                </span>
                {item.qty > 1 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[var(--color-arcane-glow)] text-[var(--color-arcane-light)] shrink-0">
                    x{item.qty}
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {inventory.bag.length === 0 && (
            <p className="text-xs text-center text-[var(--color-dim)] font-mono py-6 italic">
              Your bag is empty…
            </p>
          )}
        </div>
      </div>

      {/* ── Item Modal Overlay ───────────────── */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-void)]/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              className="glass-panel w-full p-4 flex flex-col gap-3 glow-arcane relative border-[var(--color-border-hover)]"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute top-3 right-3 text-[var(--color-dim)] hover:text-[var(--color-silver)]"
                onClick={() => setSelectedItem(null)}
              >
                ✕
              </button>
              
              <div className="flex items-center gap-3">
                <span className="text-3xl">{emoji(selectedItem.type)}</span>
                <div>
                  <h3 className="font-display font-bold text-[var(--color-silver)] text-lg leading-tight">
                    {selectedItem.name}
                  </h3>
                  <p className="text-xs font-mono uppercase text-[var(--color-dim)]">
                    {selectedItem.type}
                  </p>
                </div>
              </div>

              <div className="space-y-2 my-2 text-sm text-[var(--color-silver)]/90">
                {selectedItem.description && <p>{selectedItem.description}</p>}
                {selectedItem.effect && (
                  <p className="text-[var(--color-emerald-light)] font-mono text-xs">
                    ✦ {selectedItem.effect}
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-auto">
                {selectedItem.type === 'consumable' && (
                  <button
                    className="btn-action btn-primary flex-1 justify-center"
                    onClick={() => {
                      onItemAction?.(`I use the ${selectedItem.name}`);
                      setSelectedItem(null);
                    }}
                  >
                    Drink / Use
                  </button>
                )}
                {(selectedItem.type === 'weapon' || selectedItem.type === 'armor' || selectedItem.type === 'accessory') && (
                  <button
                    className="btn-action btn-primary flex-1 justify-center"
                    onClick={() => {
                      if (selectedItem.id.startsWith('equipped_')) {
                        onItemAction?.(`I unequip the ${selectedItem.name}`);
                      } else {
                        onItemAction?.(`I equip the ${selectedItem.name}`);
                      }
                      setSelectedItem(null);
                    }}
                  >
                    {selectedItem.id.startsWith('equipped_') ? 'Unequip' : 'Equip'}
                  </button>
                )}
                <button
                  className="btn-action flex-1 justify-center"
                  onClick={() => setSelectedItem(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
