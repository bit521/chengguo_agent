import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ToolDetail() {
  const { id } = useParams();
  const [testResult, setTestResult] = useState<any>(null);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">网页搜索</h1>
          <p className="text-muted-foreground">搜索互联网获取最新信息</p>
          <div className="flex gap-2 mt-2">
            <Badge>启用</Badge>
            <Badge variant="outline">内置工具</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">编辑</Button>
          <Button>测试</Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">详情</TabsTrigger>
          <TabsTrigger value="test">测试</TabsTrigger>
          <TabsTrigger value="logs">调用日志</TabsTrigger>
          <TabsTrigger value="stats">统计</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">工具名称:</span>
                <span>网页搜索</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">工具类型:</span>
                <span>内置工具</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">状态:</span>
                <Badge>启用</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>参数输入</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>query</Label>
                <Input placeholder="辰光Agent平台最新版本" />
              </div>
              <div className="space-y-2">
                <Label>limit</Label>
                <Input type="number" defaultValue="5" />
              </div>
              <Button className="w-full">执行测试</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>调用日志</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>耗时</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>14:32:15</TableCell>
                    <TableCell>智能客服Agent</TableCell>
                    <TableCell><Badge>成功</Badge></TableCell>
                    <TableCell>1.2s</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <p className="text-muted-foreground">统计功能开发中...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
