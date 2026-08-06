import { memo } from "react";
import { Box, Skeleton, Typography, useTheme, useMediaQuery } from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";

/**
 * Tela de carregamento (skeleton screen) para o React.lazy.
 *
 * Imita o layout real da aplicação — SideBar escura + NavBar + conteúdo com
 * cards e tabela — para que a transição entre páginas pareça instantânea e
 * suave, em vez de um spinner genérico.
 */
function PageSkeleton() {
  const theme = useTheme();
  const mostrarSideBar = useMediaQuery(theme.breakpoints.up("md"));

  const itensSidebar = [
    "Resumo da Empresa",
    "Dashboard Fiscal",
    "Facturação",
    "Inventário",
    "Previsão de Stock",
    "Clientes",
    "Fornecedores",
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F4F7F9", display: "flex" }}>
      {/* ── Skeleton da SideBar ── */}
      {mostrarSideBar && (
        <Box
          sx={{
            width: 300,
            flexShrink: 0,
            bgcolor: "#0B1220",
            display: "flex",
            flexDirection: "column",
            px: 3,
            pt: 3.5,
            pb: 2,
            gap: 1.3,
          }}
        >
          {/* Logótipo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
            <Box sx={{ bgcolor: "#083927", p: 0.9, borderRadius: 1.5, display: "flex" }}>
              <SecurityIcon sx={{ color: "#fff", fontSize: 20 }} />
            </Box>
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.05rem" }}>
              Kamba Gestão
            </Typography>
          </Box>

          {/* Itens do menu */}
          {itensSidebar.map((item, i) => (
            <Box key={item} sx={{ display: "flex", alignItems: "center", gap: 1.5, opacity: 0.9 }}>
              <Skeleton
                variant="circular"
                width={20}
                height={20}
                animation="wave"
                sx={{ bgcolor: "rgba(255,255,255,0.14)", flexShrink: 0 }}
              />
              <Skeleton
                variant="text"
                width={`${(48 + i * 7) % 88}%`}
                height={18}
                animation="wave"
                sx={{ bgcolor: "rgba(255,255,255,0.14)" }}
              />
            </Box>
          ))}

          <Box sx={{ flexGrow: 1 }} />
          <Skeleton
            variant="text"
            width="70%"
            height={18}
            animation="wave"
            sx={{ bgcolor: "rgba(255,255,255,0.10)" }}
          />
        </Box>
      )}

      {/* ── Skeleton da NavBar + Conteúdo ── */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        {/* Barra superior */}
        <Box
          sx={{
            height: 70,
            bgcolor: "#F7FAFC",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2, md: 4 },
          }}
        >
          <Skeleton variant="text" width={220} height={26} animation="wave" />
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Skeleton
              variant="rounded"
              width={{ xs: 0, sm: 220 }}
              height={36}
              animation="wave"
              sx={{ borderRadius: 2, bgcolor: "#EDF1F5", display: { xs: "none", sm: "block" } }}
            />
            <Skeleton variant="circular" width={38} height={38} animation="wave" sx={{ bgcolor: "#EDF1F5" }} />
            <Skeleton variant="circular" width={38} height={38} animation="wave" sx={{ bgcolor: "#083927" }} />
          </Box>
        </Box>

        {/* Conteúdo */}
        <Box sx={{ p: { xs: 3, md: 5 } }}>
          <Skeleton variant="text" width={280} height={32} animation="wave" />
          <Skeleton variant="text" width={400} height={16} animation="wave" sx={{ maxWidth: "90%", mb: 3.5 }} />

          {/* Cards de estatísticas */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
              gap: 2.5,
              mb: 3.5,
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <Box
                key={i}
                sx={{ bgcolor: "#fff", borderRadius: 2.5, border: "1px solid #E2E8F0", p: 2.5 }}
              >
                <Skeleton variant="circular" width={40} height={40} animation="wave" sx={{ mb: 2 }} />
                <Skeleton variant="text" width="62%" height={22} animation="wave" />
                <Skeleton variant="text" width="42%" height={15} animation="wave" />
              </Box>
            ))}
          </Box>

          {/* Tabela / card grande */}
          <Box sx={{ bgcolor: "#fff", borderRadius: 2.5, border: "1px solid #E2E8F0", p: 3 }}>
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Skeleton variant="rounded" width={110} height={34} animation="wave" sx={{ borderRadius: 2 }} />
              <Skeleton variant="rounded" width={110} height={34} animation="wave" sx={{ borderRadius: 2 }} />
            </Box>
            {[0, 1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  py: 1.6,
                  borderBottom: i < 4 ? "1px solid #F1F5F9" : "none",
                }}
              >
                <Skeleton variant="text" width="22%" height={18} animation="wave" />
                <Skeleton variant="text" width="15%" height={18} animation="wave" />
                <Skeleton variant="text" width="13%" height={18} animation="wave" />
                <Skeleton variant="rounded" width={72} height={22} animation="wave" sx={{ borderRadius: 4 }} />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default memo(PageSkeleton);
