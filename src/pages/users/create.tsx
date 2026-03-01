import { useForm } from '@refinedev/react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CreateView } from '@/components/refine-ui/views/create-view';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBack } from '@refinedev/core';
import { Loader2 } from 'lucide-react';
import { userSchema } from '@/lib/schema';
import { z } from 'zod';

const UsersCreate = () => {
  const back = useBack();
  const form = useForm({
    resolver: zodResolver(userSchema),
    refineCoreProps: { resource: 'users', action: 'create' },
    defaultValues: { name: '', email: '', role: 'student' },
  });
  const { refineCore: { onFinish }, handleSubmit, formState: { isSubmitting }, control } = form;

  const onSubmit = async (values: z.infer<typeof userSchema>) => {
    try {
      await onFinish(values);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <CreateView>
      <Breadcrumb />
      <h1 className="page-title">Create User</h1>
      <div className="intro-row">
        <p>Add a new user. They can sign in or set password later.</p>
        <Button onClick={() => back()}>Go Back</Button>
      </div>
      <Separator />
      <Card>
        <CardHeader><CardTitle>User details</CardTitle></CardHeader>
        <Separator />
        <CardContent className="mt-4">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input placeholder="Full name" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input type="email" placeholder="user@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Role <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <Separator />
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <><span>Creating...</span><Loader2 className="ml-2 inline h-4 w-4 animate-spin" /></> : 'Create User'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </CreateView>
  );
};

export default UsersCreate;
