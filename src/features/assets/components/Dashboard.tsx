import { useState } from "react";
import { useAuth } from "@/features/auth";
import { useAssets } from "../hooks/useAssets";
import { useAssetRealtime } from "../hooks/useAssetRealtime";
import { AssetList } from "./AssetList";
import { AssetForm } from "./AssetForm";
import { UpdateNotification } from "@/components/UpdateNotification";
import { Box, LogOut, Settings, Clock, CheckCircle2, Wifi, Tag, X, ListTodo, Boxes } from "lucide-react";
import { ASSET_CATEGORIES, type AssetCategory } from "@/types/database";

type Tab = "pending" | "implemented";
type MainView = "tasks" | "modeling";

export function Dashboard() {
  const { profile, signOut } = useAuth();
  const [mainView, setMainView] = useState<MainView>("tasks");
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);

  useAssetRealtime();

  const { data: pendingAssets } = useAssets({ status: "pending", category: selectedCategory });
  const { data: implementedAssets } = useAssets({ status: "implemented", category: selectedCategory });

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: "pending",
      label: "Pending",
      icon: <Clock style={{ width: 16, height: 16 }} />,
      count: pendingAssets?.length,
    },
    {
      id: "implemented",
      label: "Implemented",
      icon: <CheckCircle2 style={{ width: 16, height: 16 }} />,
      count: implementedAssets?.length,
    },
  ];

  const sidebarItems: { id: MainView; label: string; icon: React.ReactNode }[] = [
    { id: "tasks", label: "Tasks", icon: <ListTodo style={{ width: 20, height: 20 }} /> },
    { id: "modeling", label: "Modeling", icon: <Boxes style={{ width: 20, height: 20 }} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f4f7', color: '#1e1e2e', display: 'flex' }}>
      {/* Update Notification */}
      <UpdateNotification />

      {/* Left Sidebar */}
      <aside style={{
        width: 220,
        minHeight: '100vh',
        backgroundColor: '#1e1e2e',
        borderRight: '1px solid #2d2d3d',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid #2d2d3d',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: '#7c3aed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Box style={{ width: 20, height: 20, color: '#fff' }} />
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Scythe Ops</h1>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setMainView(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                backgroundColor: mainView === item.id ? 'rgba(124, 58, 237, 0.2)' : 'transparent',
                color: mainView === item.id ? '#a78bfa' : '#9ca3af',
                marginBottom: 4,
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom section */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #2d2d3d'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: 'rgba(22, 163, 74, 0.15)',
            padding: '6px 12px',
            borderRadius: 999,
            fontSize: 12,
            color: '#16a34a',
            marginBottom: 12,
            justifyContent: 'center'
          }}>
            <Wifi style={{ width: 12, height: 12 }} />
            <span>Live</span>
          </div>
          <div style={{
            fontSize: 13,
            color: '#9ca3af',
            marginBottom: 12,
            padding: '0 4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {profile?.display_name || profile?.email}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => (window.location.href = "/admin")}
              title="Admin Panel"
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 6,
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              <Settings style={{ width: 18, height: 18 }} />
            </button>
            <button
              onClick={signOut}
              title="Sign Out"
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 6,
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              <LogOut style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ marginLeft: 220, flex: 1 }}>
        {mainView === "tasks" ? (
          <main style={{ maxWidth: 1152, margin: '0 auto', padding: '32px 24px' }}>
            {/* Top Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 32,
              gap: 24,
              flexWrap: 'wrap'
            }}>
              <AssetForm />

              {/* Tabs */}
              <div style={{
                display: 'flex',
                backgroundColor: '#e8e8ed',
                borderRadius: 8,
                padding: 4
              }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 16px',
                      borderRadius: 6,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 500,
                      backgroundColor: activeTab === tab.id ? '#ffffff' : 'transparent',
                      color: activeTab === tab.id ? '#1e1e2e' : '#6b7280',
                      boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    {tab.icon}
                    {tab.label}
                    {tab.count !== undefined && (
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 999,
                        fontSize: 12,
                        backgroundColor: activeTab === tab.id ? 'rgba(124, 58, 237, 0.15)' : 'rgba(0,0,0,0.08)',
                        color: activeTab === tab.id ? '#7c3aed' : '#6b7280'
                      }}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div style={{
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                color: '#6b7280',
                marginRight: 4
              }}>
                <Tag style={{ width: 14, height: 14 }} />
                Filter:
              </div>

              {/* All button */}
              <button
                onClick={() => setSelectedCategory(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  backgroundColor: selectedCategory === null ? '#7c3aed' : '#e8e8ed',
                  color: selectedCategory === null ? '#fff' : '#6b7280',
                  transition: 'all 0.15s ease'
                }}
              >
                All
              </button>

              {/* Category buttons */}
              {Object.entries(ASSET_CATEGORIES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key as AssetCategory)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 12px',
                    borderRadius: 999,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 500,
                    backgroundColor: selectedCategory === key ? `${val.color}20` : '#e8e8ed',
                    color: selectedCategory === key ? val.color : '#6b7280',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {val.label}
                </button>
              ))}

              {/* Clear filter */}
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  title="Clear filter"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: 'rgba(107, 114, 128, 0.15)',
                    color: '#6b7280',
                    marginLeft: 4,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              )}
            </div>

            {/* Asset List */}
            <AssetList status={activeTab} category={selectedCategory} />
          </main>
        ) : (
          <main style={{ maxWidth: 1152, margin: '0 auto', padding: '32px 24px' }}>
            {/* Modeling Stub */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 400,
              backgroundColor: '#fff',
              borderRadius: 12,
              border: '2px dashed #e5e5eb',
              padding: 48
            }}>
              <Boxes style={{ width: 64, height: 64, color: '#d1d5db', marginBottom: 24 }} />
              <h2 style={{ fontSize: 24, fontWeight: 600, color: '#1e1e2e', marginBottom: 8 }}>
                Modeling
              </h2>
              <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', maxWidth: 400 }}>
                This feature is coming soon. Stay tuned for updates on our modeling capabilities.
              </p>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
